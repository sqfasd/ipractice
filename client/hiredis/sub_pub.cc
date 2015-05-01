#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sstream>
#include <iostream>
#include "hiredis/hiredis.h"
#include "hiredis/async.h"
#include "hiredis/adapters/libevent.h"

using namespace std;

void subCallback(redisAsyncContext *c, void *r, void *priv) {
  redisReply *reply = (redisReply*)r;
  if (reply == NULL) return;
  if ( reply->type == REDIS_REPLY_ARRAY && reply->elements == 3 ) {
    if ( strcmp( reply->element[0]->str, "subscribe" ) != 0 ) {
      printf( "Received[%s] channel %s: %s\n",
          (char*)priv,
          reply->element[1]->str,
          reply->element[2]->str );
    }
  }
}

void pubCallback(redisAsyncContext *c, void *r, void *priv) {
  redisReply *reply = (redisReply*)r;
  if (reply == NULL) return;
  cout << "reply->type=" << reply->type << endl;
  cout << "reply->elements=" << reply->elements << endl;
}

void connectCallback(const redisAsyncContext *c, int status) {
  if (status != REDIS_OK) {
    printf("Error: %s\n", c->errstr);
    return;
  }
  printf("Connected...\n");
}

void disconnectCallback(const redisAsyncContext *c, int status) {
  if (status != REDIS_OK) {
    printf("Error: %s\n", c->errstr);
    return;
  }
  printf("Disconnected...\n");
}

int main (int argc, char **argv) {
  if (argc < 3 || argc > 4) {
    printf("usage: %s <sub|pub> <topic|content>\n", argv[0]);
    return -1;
  }
  struct event_base *base = event_base_new();

  redisAsyncContext *c = redisAsyncConnect("127.0.0.1", 6379);
  if (c->err) {
    /* Let *c leak for now... */
    printf("Error: %s\n", c->errstr);
    return 1;
  }

  redisLibeventAttach(c,base);
  redisAsyncSetConnectCallback(c,connectCallback);
  redisAsyncSetDisconnectCallback(c,disconnectCallback);
  if (strcmp(argv[1], "sub") == 0) {
    ostringstream stream;
    stream << "SUBSCRIBE " << argv[2];
    redisAsyncCommand(c, subCallback, NULL, stream.str().c_str());
  } else if (strcmp(argv[1], "pub") == 0) {
    ostringstream stream;
    stream << "PUBLISH " << argv[2] << ' ' << argv[3];
    redisAsyncCommand(c, pubCallback, NULL, stream.str().c_str());
  } else {
    printf("operation not support\n");
  }

  event_base_dispatch(base);
  return 0;
}
