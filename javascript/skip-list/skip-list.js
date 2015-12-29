function Node(level, key, value) {
  this.level_ = level;
  this.key_ = key;
  this.value_ = value;
  this.next_ = [];
}

Node.prototype.setNext = function(level, next) {
  this.next_[level] = next;
};

Node.prototype.getNext = function(level) {
  return this.next_[level];
};

var MAX_LEVEL = 12;

function SkipList(comp) {
  this.head_ = null;
  this.maxLevel_ = 0;
  this.comp_ = comp || function(l, r) { return l < r};
}

SkipList.prototype.insert = function(key, value) {
  if (!this.head_) {
    this.head_ = new Node(0, key, value);
    this.head_.setNext(0, null);
  } else {
    var level = this.randomLevel_();
    var result = this.upperBound_(key);
    var prevs = result[1];
    var newNode = new Node(level, key, value);
    var i;
    if (level > this.maxLevel_) {
      for (i = this.maxLevel_+1; i <= level; ++i) {
        prevs[i] = this.head_;
      }
      this.maxLevel_ = level;
    }
    for (i = 0; i <= level; ++i) {
      newNode.setNext(i, prevs[i].getNext(i));
      prevs[i].setNext(i, newNode);
    }
  }
};

SkipList.prototype.update = function(key, value) {
  var node = this.upperBound_(key)[0];
  if (node && node.key_ === key) {
    node.value_ = value;
  }
};

SkipList.prototype.remove = function(key) {
  var result = this.upperBound_(key);
  var node = result[0];
  var prevs = result[1];
  if (node.key_ === key) {
    for (var i = 0; i < this.maxLevel_; ++i) {
      prevs[i].setNext(i, node.getNext(i));
    }
  }
};

SkipList.prototype.each = function(cb) {
  var node = this.head_;
  while (node) {
    cb(node.key_, node.value_, node.level_);
    node = node.getNext(0);
  }
};

SkipList.prototype.dump = function() {
  var node;
  var output;
  for (var i = this.maxLevel_; i >= 0; --i) {
    node = this.head_;
    output = [];
    while (node) {
      output.push(node.key_);
      node = node.getNext(i);
    }
    console.log(output.join(' -> '));
  }
};

SkipList.prototype.randomLevel_ = function() {
  var level = 0;
  while (level < MAX_LEVEL - 1 && level <= this.maxLevel_ && Math.random() > 0.5) {
    level++;
  }
  return level;
};

SkipList.prototype.upperBound_ = function(key) {
  var node = this.head_;
  var level = this.maxLevel_;
  var prevs = [];
  while (node) {
    var next = node.getNext(level);
    if (next && this.comp_(next.key_, key)) {
      node = next;
    } else {
      prevs[level] = node;
      if (level == 0) {
        break;
      } else {
        level--;
      }
    }
  }
  return [node, prevs];
};

module.exports = SkipList;
