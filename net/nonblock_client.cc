#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <fcntl.h>
#include <poll.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define CHECK_ERROR(cond, error) \
  do { \
    if (!(cond)) { \
      printf("%s: %s\n", error, ::strerror(errno)); \
      ::exit(1); \
    } \
  } while(0)

static void SetNonblock(int fd) {
  int flags;
  flags = ::fcntl(fd, F_GETFL);
  flags |= O_NONBLOCK;
  fcntl(fd, F_SETFL, flags);
  // check ret != -1
}

int main(int argc, char* argv[]) {
  int fd = ::socket(AF_INET, SOCK_STREAM, 0);
  CHECK_ERROR(fd != -1, "socket create error");

  struct sockaddr_in server_addr;
  ::memset(&server_addr, 0, sizeof(server_addr));
  server_addr.sin_family = AF_INET;
  server_addr.sin_addr.s_addr = ::inet_addr("127.0.0.1");
  server_addr.sin_port = ::htons(9000);
  int ret = ::connect(fd,
                      (struct sockaddr*)&server_addr,
                      sizeof(struct sockaddr));
  CHECK_ERROR(ret != -1, "connect error");

  char buffer[1024] = {0};
  int size = ::snprintf(
      buffer,
      sizeof(buffer),
      "GET /sub?seq=%d&uid=u00001&password=p00001 HTTP/1.1\r\n"
      "User-Agent: mobile_socket_client/0.1.0\r\n"
      "Accept: */*\r\n"
      "\r\n",
      -1);
  ret = ::send(fd, buffer, size, 0);
  CHECK_ERROR(ret == size, "send error");

  ::memset(buffer, 0, sizeof(buffer));
  ret = ::recv(fd, buffer, sizeof(buffer), 0);
  CHECK_ERROR(ret > 0, "recv error");

  if (::strstr(buffer, "HTTP/1.1 200") == NULL) {
    printf("htt request error: %s\n", buffer);
    return 1;
  }

  SetNonblock(fd);
  while (true) {
    struct pollfd pfds[1];
    pfds[0].fd = fd;
    pfds[0].events = POLLIN | POLLPRI;
    int ret = ::poll(pfds, 1, 100);
    if (ret == 0) {
      // printf("no events\n");
    } else if (ret > 0) {
      if (pfds[0].revents & POLLIN) {
        int n;
        do {
          char buf[1] = {0};
          n = ::read(fd, buf, 1);
          if (n == 1) {
            ::putchar(buf[0]);
          }
        } while (n == 1);
        printf("read len=%d\n", n);
        if (n == 0) {
          ::shutdown(fd, SHUT_RDWR);
          break;
        }
      }
    } else {
      CHECK_ERROR(false, "poll error");
    }
  }
  printf("connection closed\n");
}
