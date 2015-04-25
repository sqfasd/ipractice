#include "common.h"

struct EpollData {
  int fd;
  char buf[MAX_BUF_LEN];
  int buf_len;
  EpollData(int fd_) : fd(fd_), buf_len(sizeof(buf_len) - 1) {
    ::memset(buf, 0, sizeof(buf_len));
  }
};

int main(int argc, char **argv) {
  if (argc != 3) {
    printf("Usage: %s <port> <concurrency>\n", argv[0]);
    return 1;
  }
  const int port = std::stoi(argv[1]);
  CHECK(port > 1024);
  const int concurrency = std::stoi(argv[2]);
  CHECK(concurrency > 0);

  struct sockaddr_in listen_addr;
  listen_addr.sin_family = AF_INET;
  listen_addr.sin_port = ::htons(port);
  listen_addr.sin_addr.s_addr = INADDR_ANY;

  thread* threads = new thread[concurrency];
  for (int i = 0; i < concurrency; ++i) {
    threads[i] = thread([listen_addr, i]() {
      int listen_fd = CreateUdpSocket(listen_addr, true);
      CHECK(listen_fd != -1) << CERROR("CreateUdpSocket");
      LOG(INFO) << "listen_fd = " << listen_fd;
      CHECK(SetNonblocking(listen_fd) == 0) << CERROR("SetNonblocking");

      int epfd = ::epoll_create(1);
      CHECK(epfd != -1) << CERROR("epoll_create");
      struct epoll_event ev;
      EpollData* listen_data = new EpollData(listen_fd);
      ev.data.ptr = listen_data;
      ev.events = EPOLLIN | EPOLLET;
      ::epoll_ctl(epfd, EPOLL_CTL_ADD, listen_fd, &ev);
      struct sockaddr_in client_addr;
      int addr_len = sizeof(client_addr);
      const int TIMEOUT_MS = 5000;
      struct epoll_event events[EPOLL_EVENT_BATCH_SIZE];
      LOG(INFO) << "worker " << i << " started";
      while (true) {
        int nfds = ::epoll_wait(epfd, events, ARRAY_LEN(events), TIMEOUT_MS);
        VLOG(3) << nfds << " events active";
        int n;
        for (int i = 0; i < nfds; ++i) {
          EpollData* data = (EpollData*)events[i].data.ptr;
          int fd = data->fd;
          if (events[i].events & (EPOLLERR | EPOLLHUP)) {
            LOG(ERROR) << "epoll error on fd " << fd;
            continue;
          }
          if (fd == listen_fd) {
            // accept udp client
            if (events[i].events & EPOLLIN) {
              while (true) {
                n = ::recvfrom(fd,
                               data->buf,
                               sizeof(data->buf) - 1,
                               0,
                               (struct sockaddr*)&client_addr,
                               (socklen_t*)&addr_len);
                if (n > 0) {
                  VLOG(3) << "new client come at listener " << fd;
                  LOG(INFO) << "receive from [" << SockAddrToCString(client_addr)
                            << ":" << ::ntohs(client_addr.sin_port)
                            << "] " << data->buf;
                  int new_fd = CreateUdpSocket(listen_addr, true);
                  CHECK(new_fd != -1) << CERROR("CreateUdpSocket for new client");
                  CHECK(::connect(new_fd,
                                  (struct sockaddr*)&client_addr,
                                  sizeof(client_addr)) == 0)
                      << CERROR("connect to new client");
                  CHECK(SetNonblocking(new_fd) == 0)
                      << CERROR("SetNonblocking for new client");
                  EpollData* new_data = new EpollData(new_fd);
                  ::memcpy(new_data->buf, data->buf, n);
                  new_data->buf_len = n;
                  events[i].data.ptr = new_data;
                  events[i].events = EPOLLOUT | EPOLLIN | EPOLLET;
                  epoll_ctl(epfd, EPOLL_CTL_ADD, new_fd, &events[i]);
                } else {
                  if (errno == EAGAIN || errno == EWOULDBLOCK) {
                    LOG(INFO) << "no more data";
                    break;
                  } else {
                    LOG(ERROR) << CERROR("recvfrom new client");
                  }
                }
              }
            } else {
              LOG(ERROR) << "invalid events: " << events[i].events;
            }
          } else if (events[i].events & EPOLLOUT) {
            n = ::write(fd, data->buf, data->buf_len);
            VLOG(3) << "write ret=" << n;
            if (n <= 0) {
              LOG(ERROR) << CERROR("write") << ", fd=" << fd;
              ::epoll_ctl(epfd, EPOLL_CTL_DEL, fd, &events[i]);
              ::shutdown(fd, SHUT_RDWR);
            } else {
              events[i].events = EPOLLIN | EPOLLET;
              ::epoll_ctl(epfd, EPOLL_CTL_MOD, fd, &events[i]);
            }
          } else if (events[i].events & EPOLLIN) {
            n = ::read(fd, data->buf, sizeof(data->buf) - 1);
            if (n == 0) {
              LOG(INFO) << "peer shutdown fd = " << fd;
              ::epoll_ctl(epfd, EPOLL_CTL_DEL, fd, &events[i]);
              ::shutdown(fd, SHUT_RDWR);
            } else if (n < 0) {
              if (errno != EAGAIN && errno != EWOULDBLOCK) {
                LOG(ERROR) << CERROR("read") << ", fd=" << fd;
                ::epoll_ctl(epfd, EPOLL_CTL_DEL, fd, &events[i]);
                ::shutdown(fd, SHUT_RDWR);
              }
            } else {
              LOG(INFO) << "receive from fd=" << fd
                        << " " << data->buf;
              data->buf_len = n;
              events[i].events = EPOLLOUT | EPOLLET;
              ::epoll_ctl(epfd, EPOLL_CTL_MOD, fd, &events[i]);
            }
          }
        }
      }
      ::shutdown(listen_fd, SHUT_RDWR);
    });
  }

  for (int i = 0; i < concurrency; ++i) {
    threads[i].join();
  }
  delete [] threads;

  return 0;
}
