/*jshint expr: true*/
/*global describe, it*/

var should = require('should');
var HashList = require('./hash-list');

describe('hash-list', function() {
  it('test empty list', function(done) {
    var list = new HashList();
    should(list.get()).not.exists;
    should(list.get(1)).not.exists;
    should(list.get('abc')).not.exists;
    list.size().should.equal(0);
    list.remove('abc');
    list.size().should.equal(0);
    var result1 = list.select(0, 10);
    result1.should.eql([]);
    var result2 = list.select(0, 10, true);
    result2.should.eql([]);
    list.size().should.equal(0);
    done();
  });

  it('test normal operation', function(done) {
    var list = new HashList();
    list.size().should.equal(0);
    var tom = {name: 'tom', age: 27};
    list.add('tom', tom);
    list.get('tom').should.eql(tom);
    list.size().should.equal(1);
    list.remove('not-exists-key');
    list.size().should.equal(1);

    list.select(0, 1).should.eql([tom]);
    list.select(0, 10).should.eql([tom]);
    list.select(1, 10).should.eql([]);

    list.select(0, 1, true).should.eql([tom]);
    list.select(0, 10).should.eql([tom]);
    list.select(1, 10).should.eql([]);

    var jack = {name: 'jack', age: 30};
    list.add('jack', jack);
    list.size().should.equal(2);
    list.get('jack').should.eql(jack);

    list.select(0, 1).should.eql([tom]);
    list.select(0, 2).should.eql([tom, jack]);

    list.select(0, 1, true).should.eql([jack]);
    list.select(0, 2, true).should.eql([jack, tom]);

    var lucy = {name: 'lucy', age: '18'};
    list.add('lucy', lucy);
    list.size().should.equal(3);
    list.get('lucy').should.eql(lucy);

    list.select(0, 3).should.eql([tom, jack, lucy]);
    list.select(0, 4).should.eql([tom, jack, lucy]);
    list.select(1, 4).should.eql([jack, lucy]);
    list.select(2, 4).should.eql([lucy]);
    list.select(3, 4).should.eql([]);

    list.select(0, 3, true).should.eql([lucy, jack, tom]);
    list.select(0, 4, true).should.eql([lucy, jack, tom]);
    list.select(1, 4, true).should.eql([jack, tom]);
    list.select(2, 4, true).should.eql([tom]);
    list.select(3, 4, true).should.eql([]);

    var enumResult = [];
    list.each(function(item) {
      enumResult.push(item);
    });
    enumResult.should.eql([tom, jack, lucy]);

    list.remove('jack');
    list.size().should.equal(2);
    should(list.get('jack')).not.exists;
    list.select(0, 2).should.eql([tom, lucy]);
    list.select(0, 2, true).should.eql([lucy, tom]);

    enumResult = [];
    list.each(function(item) {
      enumResult.push(item);
    });
    enumResult.should.eql([tom, lucy]);

    list.add('jack', jack);

    enumResult = [];
    list.each(function(item) {
      enumResult.push(item);
    });
    enumResult.should.eql([tom, lucy, jack]);

    done();
  });

  it('remove the tail issue', function(done) {
    var list = new HashList();
    list.add('first', 1);
    list.add('second', 2);
    list.remove('second');
    list.size().should.equal(1);
    list.select(0, 2).should.eql([1]);
    list.add('second', 2);
    list.size().should.equal(2);
    list.select(0, 2).should.eql([1, 2]);
    done();
  });

  it('remove the only one issue', function(done) {
    var list = new HashList();
    list.add('first', 1);
    list.remove('first');
    list.size().should.equal(0);
    list.select(0, 2).should.eql([]);
    list.add('first', 1);
    list.size().should.equal(1);
    list.select(0, 2).should.eql([1]);
    list.add('second', 2);
    list.select(0, 2).should.eql([1, 2]);
    done();
  });
});
