#include <signal.h>
#include <string.h>

#include <map>
#include <string>
#include <atomic>

#include "net/socket/common.h"
#include "multimedia/mcu/connection.h"

using namespace std;
using namespace mcu;

static map<string, Connection*> connections;
static atomic<bool> stoped(false);

void SignalHandler(int sig) {
  LOG(INFO) << "handle signal: " << sig;
  stoped = true;
}

int main(int argc, char* argv[]) {
  ::signal(SIGINT, SignalHandler);

  const int port = 6666;
  struct sockaddr_in addr;
  addr.sin_family = AF_INET;
  addr.sin_port = ::htons(port);
  addr.sin_addr.s_addr = INADDR_ANY;

  int socket = CreateUdpSocket(addr, true);
  // FILE* file = ::fopen("./test.pcm", "w+");
  // CHECK(file);

  unsigned char buf[MAX_BUF_LEN] = {0};
  struct sockaddr_in client_addr;
  int addr_len = sizeof(client_addr);
  while (!stoped) {
    int n = ::recvfrom(socket,
                       buf,
                       sizeof(buf) - 1,
                       0,
                       (struct sockaddr*)&client_addr,
                       (socklen_t*)&addr_len);
    if (n > 0) {
      string client_addr_str = SockAddrToCString(client_addr);
      Connection* conn = nullptr;
      auto iter = connections.find(client_addr_str);
      if (iter == connections.end()) {
        conn = new Connection(client_addr_str, client_addr, socket);
        connections[client_addr_str] = conn;
      } else {
        conn = iter->second;
      }
      buf[n] = 0;
      // conn->ProcessPacket(buf, n);
      if (!::strcmp((const char*)buf, "disconnect")) {
        connections.erase(client_addr_str);
      }
      if (::strcmp((const char*)buf, "connect")) {
        // ::fwrite(buf, 1, n, file);
        for (auto& it: connections) {
          if (it.second->GetID() != client_addr_str) {
            int ret = it.second->Send(buf, n);
            LOG(INFO) << "send to " << it.second->GetID() << ": " + ret;
          }
        }
      }
      LOG(INFO) << "from " << client_addr_str << ": [" << buf << "]";
    } else if (n == 0) {
      LOG(INFO) << "peer shutdown: " << SockAddrToCString(client_addr);
    } else {
      LOG(ERROR) << CERROR("recvfrom");
    }
  }
  LOG(INFO) << "server stoped";
  ::shutdown(socket, SHUT_RDWR);
  // ::fclose(file);
}
