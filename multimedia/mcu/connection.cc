#include "connection.h"

namespace mcu {

void Connection::ReceivePacket(unsigned char* packet, int n) {
  AudioFrame* frame = new AudioFrame(packet, n);
  frame_queue_.push(frame);
}

}
