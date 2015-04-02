#ifndef PEER_H_
#define PEER_H_

#include <string>
#include <vector>
#include "../../base/blocking_queue.h"

using std::string;
using std::vector;

class Peer {
 public:
  Peer(const string& id, const vector<string>& peers);
  ~Peer();
  void Start();
  void Stop();
  void Send(const string& peer, const string& content);
  void SetMessageCallback() {}

 private:
  const string id_;
  const vector<string> peers_;
  BlockingQueue<string> outbox_;
};

#endif  // PEER_H_
