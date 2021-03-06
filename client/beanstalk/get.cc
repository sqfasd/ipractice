#include <stdio.h>
#include <assert.h>
#include ".deps/beanstalk-client/beanstalk.h"

int main(int argc, char* argv[]) {
  BSJ *job;
  int socket = bs_connect((char*)"127.0.0.1", 11300);

  assert(socket != BS_STATUS_FAIL);
  assert(bs_watch(socket,  (char*)"test")    == BS_STATUS_OK);
  assert(bs_ignore(socket, (char*)"default") == BS_STATUS_OK);

  int ret = bs_reserve_with_timeout(socket, 2, &job);
  if (ret != BS_STATUS_OK) {
    printf("bs_reserve failed with code: %d\n", ret);
  } else {
    assert(job);
    printf("reserve job id: %ld size: %lu\n", job->id, job->size);
    write(fileno(stderr), job->data, job->size);
    write(fileno(stderr), "\r\n", 2);

    printf("delete job id: %ld\n", job->id);
    assert(bs_delete(socket, job->id) == BS_STATUS_OK);
    bs_free_job(job);
  }
  bs_disconnect(socket);
}
