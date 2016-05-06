#ifndef MULTIMEDIA_MCU_AUDIO_FRAME_H_
#define MULTIMEDIA_MCU_AUDIO_FRAME_H_

#include <stdlib.h>
#include <string.h>
#include <queue>

namespace mcu {

class AudioFrame {
 public:
  AudioFrame() : data_(nullptr), len_(0) {
  }

  AudioFrame(unsigned char* buf, int len) {
    len_ = len / 2;
    data_ = new int[len_];
    for (int i = 0; i < len; i+=2) {
      data_[i>>1] = buf[i] << 8 + buf[i+1];
    }
  }

  ~AudioFrame() {
    delete [] data_;
  }

  void Copy(const AudioFrame& frame) {
    if (data_ != nullptr) {
      delete [] data_;
    }
    data_ = new int[frame.len_];
    for (int i = 0; i < frame.len_; ++i) {
      data_[i] = frame.data_[i];
    }
    len_ = frame.len_;
  }

  void AddFrame(const AudioFrame& frame) {
    for (int i = 0; i < frame.len_ && i < len_; ++i) {
      data_[i] += frame.data_[i];
    }
  }

  void Substract(const AudioFrame& frame) {
    for (int i = 0; i < frame.len_ && i < len_; ++i) {
      data_[i] -= frame.data_[i];
    }
  }

  unsigned char* ToSampleData() {
    short* buf = (short*)::malloc(len_ * 2);
    for (int i = 0; i < len_; ++i) {
      if (data_[i] > 32768) {
        buf[i] = 32768;
      } else if (data_[i] < - 32768) {
        buf[i] = -32768;
      } else {
        buf[i] = data_[i];
      }
    }
    return (unsigned char*)buf;
  }

  bool IsEmpty() const {
    if (data_ == nullptr || len_ == 0) {
      return true;
    }
    if (data_[0] == 0 && data_[1] == 0) {
      return true;
    }
    return false;
  }

  int Length() const {
    return len_;
  }

 private:
  int* data_;
  int len_;
};

}

#endif  // MULTIMEDIA_MCU_AUDIO_FRAME_H_
