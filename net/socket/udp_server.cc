#include "common.h"

int main(int argc, char **argv) {
  if (argc != 3) {
    printf("Usage: %s <port> <concurrency>\n", argv[0]);
    return 1;
  }
  const int port = std::stoi(argv[1]);
  CHECK(port > 1024);
  const int concurrency = std::stoi(argv[2]);
  CHECK(concurrency > 0);

  struct sockaddr_in addr;
  addr.sin_family = AF_INET;
  addr.sin_port = ::htons(port);
  addr.sin_addr.s_addr = INADDR_ANY;

  int sock_fd = CreateUdpSocket(addr, true);

  thread* threads = new thread[concurrency];
  for (int i = 0; i < concurrency; ++i) {
    threads[i] = thread([sock_fd, i]() {
      char buff[MAX_BUF_LEN] = {0};
      struct sockaddr_in client_addr;
      int addr_len = sizeof(client_addr);
      LOG(INFO) << "worker " << i << " started";
      while (1) {
        int n = ::recvfrom(sock_fd,
                           buff,
                           sizeof(buff) - 1,
                           0,
                           (struct sockaddr*)&client_addr,
                           (socklen_t*)&addr_len);
        if (n > 0) {
          buff[n] = 0;
          LOG(INFO) << "from [" << SockAddrToCString(client_addr)
                    << ":" << ::ntohs(client_addr.sin_port)
                    << "] " << buff;
          n = ::sendto(sock_fd,
                       buff,
                       n,
                       0,
                       (struct sockaddr*)&client_addr,
                       addr_len);
          if (n < 0) {
            LOG(ERROR) << CERROR("sendto");
          }
        } else if (n == 0) {
          LOG(INFO) << "peer shutdown: [" << SockAddrToCString(client_addr)
                    << ":" << ::ntohs(client_addr.sin_port) << "]";
        } else {
          LOG(ERROR) << CERROR("recvfrom");
        }
      }
    });
  }

  for (int i = 0; i < concurrency; ++i) {
    threads[i].join();
  }
  delete [] threads;

  ::shutdown(sock_fd, SHUT_RDWR);

  return 0;
}
