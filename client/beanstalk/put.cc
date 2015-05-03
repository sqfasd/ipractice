#include <unistd.h>
#include <stdio.h>
#include <assert.h>
#include ".deps/beanstalk-client/beanstalk.h"

int main(int argc, char* argv[]) {
  int id, socket = bs_connect((char*)"127.0.0.1", 11300);

  assert(socket != BS_STATUS_FAIL);
  assert(bs_use(socket,    (char*)"test")    == BS_STATUS_OK);

  // sleep(3);
  printf("before bs_put\n");
  id = bs_put(socket, 0, 0, 60, argv[1], strlen(argv[1]));

  if (id <= 0) {
    printf("bs_put failed with code: %d\n", id);
  } else {
    printf("put job id: %d\n", id);
  }
  bs_disconnect(socket);
}
