#include "http_client.h"
#include <stdlib.h>
#include <iostream>

using namespace std;

void OnRequestDone(const HttpClient* client, const std::string& data) {
  cout << data << endl;
}

void OnChunk(const HttpClient* client, const std::string& data) {
  cout << data << endl;
}

int main(int argc, char* argv[]) {
  if (argc != 6) {
    printf("usage: %s <host> <port> <path> <method> <data>\n", argv[0]);
    return 0;
  }
  struct event_base* evbase = event_base_new();
  assert(evbase);

  HttpRequestOption option = {
    argv[1],
    atoi(argv[2]),
    argv[4],
    argv[3],
    argv[5]
  };
  HttpClient client(evbase, option);
  client.SetRequestDoneCallback(&OnRequestDone);
  client.SetChunkCallback(&OnChunk);
  client.StartRequest();

  event_base_dispatch(evbase);

  event_base_free(evbase);
}
