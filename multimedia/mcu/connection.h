#ifndef MULTIMEDIA_MCU_CONNECTION_H_
#define MULTIMEDIA_MCU_CONNECTION_H_

#include <sys/types.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <string>

#include "audio_frame.h"

namespace mcu {

class Connection {
 public:
  Connection(const std::string& id, struct sockaddr_in addr, int socket)
      : id_(id), addr_(addr), socket_(socket) {
  }
  ~Connection() {}
  void ReceivePacket(unsigned char* packet, int n);
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
  AudioFrame* GetOneFrame() {
    if (frame_queue_.empty()) {
      return nullptr;
    } else {
      AudioFrame* f = frame_queue_.front();
      frame_queue_.pop();
      return f;
    }
  }

 private:
  std::string id_;
  struct sockaddr_in addr_;
  int socket_;
  std::queue<AudioFrame*> frame_queue_;
};

}

#endif  // MULTIMEDIA_MCU_CONNECTION_H_
