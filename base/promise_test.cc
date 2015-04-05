#include <unistd.h>
#include <stdlib.h>
#include <time.h>
#include <string>
#include <thread>
#include "promise.h"

using namespace std;

thread th;
thread th1;
thread th2;

void Func(string s, Callback cb) {
  th = thread([=]() {
    LOG(INFO) << "doing slow work for: " << s;
    sleep(1);
    LOG(INFO) << "done";
    if (rand() % 2 == 0) {
      cb("", "shan");
    } else {
      cb("unknow error", "");
    }
  });
}

int main(int argc, char* argv[]) {
  ::srand(::time(0));
  auto func = base::Promise::PromiseIfy(Func);
  func("query db")->Then([](string result) {
    LOG(INFO) << "result1: " << result;
    return result + " qingfeng";
  })
  ->Then([](string result) {
    LOG(INFO) << "result2: " << result;
    return "";
  })
  ->Fail([](string error) {
    LOG(ERROR) << "failed: " << error;
  });

  if (th.joinable()) {
    th.join();
  }
  LOG(INFO) << "exit main";
}

typedef function<void(Error, int)> Callback1;
typedef function<void(Error)> Callback2;

void GetMaxSeq(string uid, Callback1 cb) {
  th1 = thread([=]() {
    LOG(INFO) << "GetMaxSeq for: " << uid;
    sleep(1);
    LOG(INFO) << "done";
    if (rand() % 2 == 0) {
      cb("", 1);
    } else {
      cb("unknow error", -1);
    }
  });
}

void SaveMessage(string message, Callback2 cb) {
  th2 = thread([=]() {
    LOG(INFO) << "SaveMessage: " << message;
    sleep(1);
    LOG(INFO) << "done";
    if (rand() % 2 == 0) {
      cb("");
    } else {
      cb("unknow error");
    }
  });
}

auto get_max_seq = Promiseify(bind(GetMaxSeq, "user1"));
auto save_message = Promiseify(SaveMessage);

get_max_seq().then([](int seq){
  return ("this is message: ") + std::to_string(seq);
}).then(save_message).then([]() {
  LOG(INFO) << "ok!";
}).fail([](string error) {
  LOG(INFO) << "failed: " << error;
});
