function ListNode(data) {
  this.next = null;
  this.prev = null;
  this.data = data;
}

function HashList(compare) {
  this.head = null;
  this.tail = null;
  this.map = {};
  this.compare = compare;
}

HashList.prototype.add = function(key, value) {
  var newNode = new ListNode(value);
  this.map[key] = newNode;
  if (this.head == null) {
    this.head = this.tail = newNode;
  } else if (this.head == this.tail) {
    if (this.compare(value, this.head.data)) {
      this.head.prev = newNode;
      newNode.next = this.head;
      this.head = newNode;
    } else {
      this.head.next = newNode;
      newNode.prev = this.head;
      this.tail = newNode;
    }
  } else {
    var node = this.head;
    while (node) {
      if (this.compare(value, node.data)) {
        var prev = node.prev;
        if (prev) {
          prev.next = newNode;
        }
        node.prev = newNode;
        newNode.prev = prev;
        newNode.next = node;
        if (this.head == node) {
          this.head = newNode;
        }
        break;
      }
      node = node.next;
    }
    if (!node) {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
  }
}

HashList.prototype.get = function(key) {
  var node = this.map[key];
  if (node) {
    return node.data;
  } else {
    return null;
  }
}

HashList.prototype.del = function(key) {
  var node = this.map[key];
  if (node) {
    var prev = node.prev;
    var next = node.next;
    if (prev) {
      prev.next = next;
    }
    if (next) {
      next.prev = prev;
    }
    delete this.map[key];
  }
}

HashList.prototype.select = function(offsetKey, limit, reverse) {
  var result = [];
  if (limit <= 0) {
    return result;
  }

  var node = this.map[offsetKey];
  if (!node) {
    if (reverse) {
      node = this.tail;
    } else {
      node = this.head;
    }
  }
  while (node && limit--) {
    result.push(node.data);
    if (reverse) {
      node = node.prev;
    } else {
      node = node.next;
    }
  }
  return result;
}

HashList.prototype.print = function() {
  var node = this.head;
  while (node) {
    console.log(node.data);
    node = node.next;
  }
}

if (!module.parent) {
  var list = new HashList(function(left, right) {
    return left.score >= right.score;
  });
  list.add('k1', {name: 'qingfeng', score: '1'});
  list.add('k2', {name: 'qingfeng', score: '8'});
  list.add('k3', {name: 'qingfeng', score: '4'});
  list.add('k4', {name: 'qingfeng', score: '7'});
  list.add('k5', {name: 'qingfeng', score: '2'});
  list.add('k6', {name: 'qingfeng', score: '3'});
  list.add('k7', {name: 'qingfeng', score: '5'});
  list.add('k8', {name: 'qingfeng', score: '6'});

  console.log('--------------------');
  list.print();
  console.log('--------------------');

  console.log('get k1', list.get('k1'));
  console.log('get k2', list.get('k2'));
  console.log('select k2 4', list.select('k2', 4));
  console.log('select k1 4 reverse', list.select('k1', 4, true));
  list.del('k4');
  console.log('after remove k4, select k2 4', list.select('k2', 4));
  console.log('after remove k4, select k1 4 reverse', list.select('k1', 4, true));
}
