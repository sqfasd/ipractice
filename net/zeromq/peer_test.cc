#include <stdio.h>
#include <assert.h>
#include <iostream>
#include <string>
#include "peer.h"

using namespace std;

void SplitString(const string& input,
                 const char delimeter,
                 vector<string>& output) {
  int start = 0;
  int pos = -1;
  while ((pos = input.find(delimeter, start)) != string::npos) {
    output.push_back(input.substr(start, pos - start));
    start = pos + 1;
  }
  output.push_back(input.substr(start, input.length() - start));
}

int main(int argc, char* argv[]) {
  if (argc != 3) {
    cout << "usage: " << argv[0] << " <total_peer_num> <peer_id>" << endl;
    return -1;
  }
  int peer_num = std::stoi(argv[1]);
  assert(peer_num > 1);
  int id = std::stoi(argv[2]);
  assert(id < peer_num);
  vector<PeerInfo> peer_infos;
  for (int i = 0; i < peer_num; ++i) {
    if (id != i) {
      PeerInfo info;
      info.id = i;
      info.ip = "localhost";
      peer_infos.push_back(info);
    }
  }
  Peer peer(id, peer_infos);
  peer.Start();

  string input;
  while (std::getline(cin, input)) {
    vector<string> fields;
    SplitString(input, ' ', fields);
    if (input.empty() || fields.size() == 0) {
      continue;
    } else if (fields.size() == 1) {
      if (fields[0] == "q") {
        break;
      } else if (fields[0] == "?") {
        cout << "usage: " << endl
             << "?\tdisplay this" << endl
             << "q\tfinish the program" << endl
             << "s <target> <content>\tfinish the program" << endl;
      }
    } else if (fields.size() == 3 && fields[0] == "s") {
      peer.Send(std::stoi(fields[1]), fields[2]);
    }
  }
}
