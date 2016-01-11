#ifndef MULTIMEDIA_MCU_CONNECTION_H_
#define MULTIMEDIA_MCU_CONNECTION_H_

#include <sys/types.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <string>

namespace mcu {

class Connection {
 public:
  Connection(const std::string& id, struct sockaddr_in addr, int socket)
      : id_(id), addr_(addr), socket_(socket) {
  }
  ~Connection() {}
  void ProcessPacket(unsigned char* packet, int n);
  std::string GetID() const {
    return id_;
  }
  int Send(unsigned char* packet, int n) const {
    return ::sendto(socket_,
           packet,
           n,
           0,
           (struct sockaddr*)&addr_,
           sizeof(addr_));
  }

 private:
  std::string id_;
  struct sockaddr_in addr_;
  int socket_;
};

}

#endif  // MULTIMEDIA_MCU_CONNECTION_H_
