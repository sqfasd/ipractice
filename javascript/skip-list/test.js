/*jshint expr: true*/
/*global describe, it*/

var should = require('should');
var SkipList = require('./skip-list');

describe('skip-list', function() {
  it('test empty list', function(done) {
    var list = new SkipList();
    list.insert(1, 1);
    list.insert(2, 2);
    list.insert(3, 2);
    list.insert(10, 10);
    list.insert(7, 10);
    list.insert(5, 10);
    list.insert(4, 10);
    list.insert(6, 10);
    list.insert(9, 10);
    list.insert(8, 10);
    list.dump();
    done();
  });
});
