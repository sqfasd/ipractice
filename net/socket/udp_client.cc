#include "common.h"

const char* CLIENT_IP = "127.0.0.1";
const int CLIENT_START_PORT = 20000;
const int EPOLL_EVENT_BATCH_SIZE = 4096;

struct ClientInfo {
  int fd;
  int send_num;
  int recv_num;
  ClientInfo() :send_num(0), recv_num(0) {
  }
};

static std::atomic<bool> stoped(false);
static int g_total_send = 0;
static int g_total_recv = 0;
static int g_total_error = 0;
static int g_total_close1 = 0;
static int g_total_close2 = 0;

static void DumpStatsReport() {
  LOG(INFO) << "total_send: " << g_total_send
            << ", total_recv: " << g_total_recv
            << ", total_error: " << g_total_error
            << ", total_close1: " << g_total_close1
            << ", total_close2: " << g_total_close2;
}

int main(int argc, char **argv) {
  if (argc != 5) {
    printf("Usage: %s <ip> <port> <n> <c>\n", argv[0]);
    return 1;
  }
  const char* server_ip = argv[1];
  const int server_port = std::stoi(argv[2]);
  const int request_num = std::stoi(argv[3]);
  const int concurrency = std::stoi(argv[4]);
  const int req_num_per_client = request_num / concurrency;

  CHECK(server_port > 0);
  CHECK(request_num > 0);
  CHECK(concurrency > 0);

  struct sockaddr_in server_addr;
  server_addr.sin_family = AF_INET;
  server_addr.sin_addr.s_addr = ::inet_addr(argv[1]);
  server_addr.sin_port = ::htons(atoi(argv[2]));
  CHECK(server_addr.sin_addr.s_addr != INADDR_NONE) << "invlaid ip";

  int invalid_fd_num = 0;
  int* client_fds = new int[concurrency];
  for (int i = 0; i < concurrency; ++i) {
    struct sockaddr_in client_addr;
    client_addr.sin_family = AF_INET;
    client_addr.sin_addr.s_addr = ::inet_addr(CLIENT_IP);
    client_addr.sin_port = ::htons(CLIENT_START_PORT + i);
    client_fds[i] = CreateUdpSocket(client_addr, false);
    if (client_fds[i] == -1) {
      LOG(ERROR) << "CreateUdpSocket with port " << CLIENT_START_PORT + i
                 << " failed: " << CERROR();
    } else {
      CHECK(::connect(client_fds[i],
                      (struct sockaddr*)&server_addr,
                      sizeof(server_addr)) == 0)
          << CERROR("connect");
      CHECK(SetNonblocking(client_fds[i]) == 0) << CERROR("SetNonblocking");
      invalid_fd_num++;
    }
  }

  int epfd = ::epoll_create(1);
  CHECK(epfd != -1) << CERROR("epoll_create");
  struct epoll_event ev;
  for (int i = 0; i < concurrency; ++i) {
    if (client_fds[i] != -1) {
      ev.events = EPOLLOUT | EPOLLIN | EPOLLET;
      ev.data.fd = client_fds[i];
      ClientInfo* client = new ClientInfo();
      client->fd = client_fds[i];
      ev.data.ptr = client;
      CHECK(::epoll_ctl(epfd, EPOLL_CTL_ADD, client_fds[i], &ev) == 0);
    }
  }

  char buff[] = "hello world";
  const int buff_len = ::strlen(buff);
  const int TIMEOUT_MS = 5000;
  struct epoll_event events[EPOLL_EVENT_BATCH_SIZE];

  thread stats_thread([]() {
    while (!stoped) {
      ::sleep(5);
      DumpStatsReport();
    }
  });

  struct timeval start_time;
  ::gettimeofday(&start_time, NULL);

  while (true) {
    if (g_total_recv >= request_num) {
      break;
    }
    int nfds = ::epoll_wait(epfd, events, ARRAY_LEN(events), TIMEOUT_MS);
    LOG(INFO) << nfds << " events active";
    int n;
    for (int i = 0; i < nfds; ++i) {
      ClientInfo* client_info = (ClientInfo*)events[i].data.ptr;
      int fd = client_info->fd;
      if (events[i].events & (EPOLLERR | EPOLLHUP)) {
        ++g_total_error;
        LOG(ERROR) << "epoll error";
        ::epoll_ctl(epfd, EPOLL_CTL_DEL, fd, &events[i]);
        ::shutdown(fd, SHUT_RDWR);
      }
      if (events[i].events & (EPOLLIN | EPOLLPRI)) {
        n = ::read(fd, buff, buff_len);
        if (n > 0) {
          ++g_total_recv;
          client_info->recv_num++;
          if (client_info->recv_num >= req_num_per_client) {
            ++g_total_close2;
            ::epoll_ctl(epfd, EPOLL_CTL_DEL, fd, &events[i]);
            ::shutdown(fd, SHUT_RDWR);
          }
        } else if (n == 0) {
          ++g_total_close1;
          ::epoll_ctl(epfd, EPOLL_CTL_DEL, fd, &events[i]);
          ::shutdown(fd, SHUT_RDWR);
        } else if (n == -1) {
          ++g_total_error;
          LOG(ERROR) << CERROR("recvfrom");
          ::shutdown(fd, SHUT_RDWR);
        }
      }
      if (events[i].events & EPOLLOUT) {
        n = ::write(fd, buff, buff_len);
        if (n <= 0) {
          ++g_total_error;
          LOG(ERROR) << CERROR("write") << ", fd=" << fd;
          ::epoll_ctl(epfd, EPOLL_CTL_DEL, fd, &events[i]);
          ::shutdown(fd, SHUT_RDWR);
        } else {
          ++g_total_send;
          client_info->send_num++;
          if (client_info->send_num >= req_num_per_client) {
            events[i].events &= ~EPOLLOUT;
            ::epoll_ctl(epfd, EPOLL_CTL_MOD, fd, &events[i]);
          }
        }
      }
    }
  }
  struct timeval end_time;
  ::gettimeofday(&end_time, NULL);
  
  int64 time_use_ms = (end_time.tv_sec - start_time.tv_sec) * 1000 +
                      (end_time.tv_usec - start_time.tv_usec) / 1000;
  cout << "time use: " << time_use_ms << " ms" << endl;

  double qps = 1.0 * request_num / time_use_ms * 1000;
  cout << "qps: " << qps << endl;
  cout << "transfer rate: " << qps * buff_len << endl;
  
  stoped = true;
  stats_thread.join();
  ::close(epfd);
  delete [] client_fds;

  return 0;
}
