#ifndef SHARDING_H_
#define SHARDING_H_

#include <stdio.h>
#include <assert.h>
#include <string>
#include <vector>
#include <map>

typedef unsigned int uint32;
typedef unsigned long long uint64;
typedef unsigned char uint8;

const uint32 kFingerPrintSeed = 19820125;
const int VIRTUAL_NODE_NUM = 100;

template<typename Node>
class Sharding {
 public:
  Sharding(const std::vector<Node>& nodes) {
    assert(nodes.size() > 0);
    for (int i = 0; i < nodes.size(); ++i) {
      for (int j = 0; j < VIRTUAL_NODE_NUM; ++j) {
        char buf[20] = {0};
        int n = ::sprintf(buf, "%d:%d", i, j);
        mapping_[MurmurHash64A(buf, n, kFingerPrintSeed)] = nodes[i];
      }
    }
  }

  ~Sharding() {
  }

  const Node& operator[](const std::string& key) {
    uint64 hash = MurmurHash64A(key.c_str(), key.length(), kFingerPrintSeed);
    typename Map::const_iterator iter = mapping_.lower_bound(hash);
    return iter->second;
  }

 private:
  uint64 MurmurHash64A(const void* key, int len, uint32 seed) {
    const uint64 m = 0xc6a4a7935bd1e995;
    const int r = 47;

    uint64 h = seed ^ (len * m);

    const uint64* data = (const uint64 *)key;
    const uint64* end = data + (len/8);

    while (data != end) {
      uint64 k = *data++;

      k *= m;
      k ^= k >> r;
      k *= m;

      h ^= k;
      h *= m;
    }

    const uint8* data2 = (const uint8*)data;

    switch (len & 7) {
      case 7: h ^= static_cast<uint64>(data2[6]) << 48;
      case 6: h ^= static_cast<uint64>(data2[5]) << 40;
      case 5: h ^= static_cast<uint64>(data2[4]) << 32;
      case 4: h ^= static_cast<uint64>(data2[3]) << 24;
      case 3: h ^= static_cast<uint64>(data2[2]) << 16;
      case 2: h ^= static_cast<uint64>(data2[1]) << 8;
      case 1: h ^= static_cast<uint64>(data2[0]);
              h *= m;
    };

    h ^= h >> r;
    h *= m;
    h ^= h >> r;

    return h;
  }

  typedef std::map<uint64, Node> Map;
  Map mapping_;
};

#endif  // SHARDING_H_
