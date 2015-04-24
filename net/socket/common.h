#include <sys/types.h>
#include <sys/socket.h>
#include <sys/epoll.h>
#include <sys/time.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <poll.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include <iostream>
#include <string>
#include <thread>
#include <atomic>

#include "base/basictypes.h"
#include "base/logging.h"

using namespace std;

#define CERROR(str) (string(str) + ": " + ::strerror(errno))
#define ARRAY_LEN(arr) (sizeof(arr) / sizeof(arr[0]))

const int MAX_BUF_LEN = 512;
const int EPOLL_EVENT_BATCH_SIZE = 4096;

inline int CreateUdpSocket(struct sockaddr_in& addr, bool reuse_addr) {
  int fd = ::socket(AF_INET, SOCK_DGRAM, 0);
  if (fd == -1) {
    return fd;
  }

  int ret;
  if (reuse_addr) {
    int opt=1;
    ret = ::setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    if (ret != 0) {
      return ret;
    }
    ret = ::setsockopt(fd, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt));
    if (ret != 0) {
      return ret;
    }
  }

  ret = ::bind(fd, (struct sockaddr*)&addr, sizeof(addr));
  if (ret != 0) {
    return ret;
  }
  return fd;
}

inline int SetNonblocking(int fd) {
  if (fcntl(fd, F_SETFL, fcntl(fd, F_GETFD, 0) | O_NONBLOCK) == -1) {
    return -1;
  }
  return 0;
}

inline const char* SockAddrToCString(struct sockaddr_in& addr) {
  static char buf[128] = {0};
  return inet_ntop(AF_INET, &addr, buf, sizeof(buf));
}
