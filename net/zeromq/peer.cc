#include "peer.h"
#include "zhelpers.h"

Peer::Peer(const string& id, const vector<string>& peers)
    : id_(id), peers_(peers) {
}

Peer::~Peer() {
}

void Peer::Start() {
}

void Peer::Send(const string& peer, const string& content) {
}

void Peer::Stop() {
}

void Peer::Sending() {
  zmq::context_t context(1);
  zmq::socket_t publisher(context, ZMQ_PUB);
  publisher.bind("tcp://*:5563");

  while (1) {
    //  Write two messages, each with an envelope and content
    s_sendmore (publisher, "A");
    s_send (publisher, "We don't want to see this");
    s_sendmore (publisher, "B");
    s_send (publisher, "We would like to see this");
    sleep (1);
  }
}

void Peer::Receiving() {
}
