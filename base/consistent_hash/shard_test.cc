#include <stdlib.h>
#include <vector>
#include <string>
#include <iostream>

#include "sharding.h"

using namespace std;

int main(int argc, char* argv[]) {
  vector<string> nodes;
  int node_num = ::atoi(argv[1]);
  int key_num = ::atoi(argv[2]);
  for (int i = 0; i < node_num; ++i) {
    char buf[20] = {0};
    sprintf(buf, "s%d", i);
    nodes.push_back(buf);
  }
  Sharding<string> sharding(nodes);
  for (int i = 0; i < key_num; ++i) {
    char buf[20] = {0};
    sprintf(buf, "u%d", i);
    cout << buf << "\t" << sharding[buf] << endl;
  }
}
