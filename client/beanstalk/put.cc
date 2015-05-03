#include <stdio.h>
#include <assert.h>
#include ".deps/beanstalk-client/beanstalk.h"

int main(int argc, char* argv[]) {
  int id, socket = bs_connect("127.0.0.1", 11300);

  assert(socket != BS_STATUS_FAIL);
  assert(bs_use(socket,    "test")    == BS_STATUS_OK);
  assert(bs_watch(socket,  "test")    == BS_STATUS_OK);
  assert(bs_ignore(socket, "default") == BS_STATUS_OK);

  id = bs_put(socket, 0, 0, 60, argv[1], strlen(argv[1]));

  assert(id > 0);
  printf("put job id: %d\n", id);

  bs_disconnect(socket);
}
