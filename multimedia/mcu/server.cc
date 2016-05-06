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
      LOG(INFO) << "receive " << n << " bytes from " << client_addr_str;

      Connection* conn = nullptr;
      auto iter = connections.find(client_addr_str);
      if (iter == connections.end()) {
        conn = new Connection(client_addr_str, client_addr, socket);
        connections[client_addr_str] = conn;
      } else {
        conn = iter->second;
      }
      buf[n] = 0;
      if (!::strcmp((const char*)buf, "connect")) {
        LOG(INFO) << conn->GetID() << " connected";
      } else if (!::strcmp((const char*)buf, "disconnect")) {
        LOG(INFO) << conn->GetID() << " disconnected";
        connections.erase(client_addr_str);
      } else {
        // conn->ReceivePacket(buf, n);
        // conn->Send(buf, n);
        for (auto& it : connections) {
          if (it.second->GetID() != client_addr_str) {
            int ret = it.second->Send(buf, n);
            LOG(INFO) << "send to " << it.second->GetID() << " " << ret << " bytes";
          }
        }
      }
      continue;

      AudioFrame compound_frame;
      map<string, AudioFrame*> private_frames;

      for (auto& it : connections) {
        conn = it.second;
        AudioFrame* tmp = conn->GetOneFrame();
        if (tmp != nullptr) {
          private_frames[conn->GetID()] = tmp;
          if (compound_frame.IsEmpty()) {
            compound_frame.Copy(*tmp);
          } else {
            compound_frame.AddFrame(*tmp);
          }
        }
      }
      LOG(INFO) << "compound_frame samples " << compound_frame.Length();
      for (auto& it : connections) {
        conn = it.second;
        AudioFrame* its_last_frame = private_frames[conn->GetID()];
        if (its_last_frame != nullptr) {
          compound_frame.Substract(*its_last_frame);
        }
        if (!compound_frame.IsEmpty()) {
          unsigned char* sample_data = compound_frame.ToSampleData();
          int bytes_send = conn->Send(sample_data, compound_frame.Length() * 2);
          LOG(INFO) << "send " << bytes_send << " bytes to " << conn->GetID();
          ::free(sample_data);
        }
      }
      for (auto& it : private_frames) {
        delete it.second;
      }
    } else if (n == 0) {
      LOG(INFO) << "peer shutdown: " << SockAddrToCString(client_addr);
    } else {
      LOG(ERROR) << CERROR("recvfrom");
    }
  }
  LOG(INFO) << "server stoped";
  ::shutdown(socket, SHUT_RDWR);
}
