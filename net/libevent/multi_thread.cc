#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <pthread.h>
#include <event.h>
#include "event_msgqueue.h"

typedef void (*Callback)(void*);

char* AllocData() {
  char* data = new char[20];
  strcpy(data, "the data");
  return data;
}

void FreeData(char* ptr) {
  delete [] ptr;
}

struct Closure {
  int delay;
  Callback cb;
  void* user_data;
  void Run() {
    cb(user_data);
  }
};

struct event_base* evbase;
pthread_t pid;
event_msgqueue* eq;

void MQCallback(void* arg1, void* arg2/*maybe this for c++ class*/) {
  Closure* closure = (Closure*)arg1;
  closure->Run();
}

void DoSomething(void* user_data) {
  char* data = (char*)user_data;
  printf("DoSomething(%s)\n", data);
  FreeData(data);
}

void RunAfter(int sec) {
  printf("before RunAfter\n");
  sleep(sec);
  printf("%d seconds passed\n", sec);
  DoSomething(AllocData());
  printf("after RunAfter\n");
}

void* ThreadRunner(void* arg) {
  Closure* closure = (Closure*)arg;
  sleep(closure->delay);
  closure->user_data = AllocData();
  msgqueue_push(eq, closure);
}

void RunAfterAsync(int sec) {
  printf("enter RunAfterAsync\n");

  pthread_attr_t attr;
  assert(pthread_attr_init(&attr) == 0);
  assert(pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED) == 0);
  Closure* closure = new Closure();
  closure->delay =  sec;
  closure->cb = &DoSomething;
  assert(pthread_create(&pid, &attr, &ThreadRunner, closure) == 0);

  printf("exit RunAfterAsync\n");
}

void timer_cb(evutil_socket_t sig, short events, void* user_data) {
  static bool has_run = false;
  const int DELAY_SEC = 5;
  printf("timer_cb()\n");
  if (!has_run) {
    char* method = (char*)user_data;
    if (strcmp(method, "nonblock") == 0) {
      RunAfterAsync(DELAY_SEC);
    } else if (strcmp(method, "block") == 0) {
      RunAfter(DELAY_SEC);
    } else {
      printf("invalid parameters\n");
      exit(-1);
    }
    has_run = true;
  }
}

int main(int argc, char* argv[]) {
  if (argc != 2) {
    printf("usage: %s block|nonblock\n", argv[0]);
    return 0;
  }
  evbase = event_base_new();
  eq = msgqueue_new(evbase, 100, &MQCallback, NULL);
  struct event* timer_event = event_new(evbase, -1, EV_PERSIST, timer_cb, argv[1]);
  struct timeval tv;
  tv.tv_sec = 1;
  tv.tv_usec = 0;
  if (!timer_event || evtimer_add(timer_event, &tv) < 0) {
    fprintf(stderr, "create timer event failed\n");
    exit(-1);
  }
	event_base_dispatch(evbase);
}
