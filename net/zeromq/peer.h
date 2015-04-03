#ifndef PEER_H_
#define PEER_H_

#include <string>
#include <vector>
#include <atomic>
#include <thread>
#include <memory>
#include "../../base/blocking_queue.h"

using std::string;
using std::vector;
using std::shared_ptr;

struct PeerInfo {
  int id;
  string ip;
};

struct PeerMessage {
  int target;
  string content;
};

typedef shared_ptr<PeerMessage> PeerMessagePtr;

class Peer {
 public:
  Peer(const int id, const vector<PeerInfo>& peers);
  ~Peer();
  void Start();
  void Stop();
  void Send(const int target, const string& content);
  void SetMessageCallback() {}

 private:
  void Sending();
  void Receiving();

  const int id_;
  const vector<PeerInfo> peers_;
  base::BlockingQueue<PeerMessagePtr> outbox_;
  std::atomic<bool> stoped_;
  std::thread send_thread_;
  std::thread recv_thread_;
};

#endif  // PEER_H_
