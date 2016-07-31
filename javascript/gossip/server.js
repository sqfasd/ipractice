const http = require('http');
const modurl = require('url');
const format = require('util').format;
const request = require('request');
const async = require('async');
const sharding = require('./sharding');



var id = Number(process.argv[2]);
var total  = Number(process.argv[3]);
var msgs = {};

var buckets = [];
for (let i = 0; i < Math.sqrt(total); ++i) {
  buckets.push('bucket' + i);
}
var shard = new sharding.Sharding(buckets, {vnode_num: 10000});

function randomTargets(n) {
  var targets = [];
  for (var i = 0; i < 9999; ++i) {
    var t = Math.floor(Math.random() * total);
    if (t != id && targets.indexOf(t) == -1) {
      targets.push(t);
      if (targets.length >= n) {
        break;
      }
    }
  }
  return targets;
}

function firstRoundTargets() {
  var bucketMap = {};
  var targets = [];
  for (let i = 0; i < total; ++i) {
    var bucket = shard.shard('' + i);
    if (i != id && !bucketMap[bucket]) {
      bucketMap[bucket] = 1;
      targets.push(i);
      if (targets.length >= buckets.length) {
        break;
      }
    }
  }
  return targets;
}

function secondRoundTargets() {
  var targets = [];
  var thisBucket = shard.shard('' + id);
  for (let i = 0; i < total; ++i) {
    var bucket = shard.shard('' + i);
    if (i != id && bucket == thisBucket) {
      targets.push(i);
      if (targets.length >= buckets.length) {
        break;
      }
    }
  }
  return targets;
}

const server = http.createServer((req, res) => {
  var query = modurl.parse(req.url, true).query;
  var n = Number(query.n);
  var round = query.path.split('->').length - 1;
  var isRandom = Number(query.random);
  console.log('round' + round, query.msg, id);
  if (!msgs[query.msg]) {
    msgs[query.msg] = 1;
    var n = Number(query.n);
    var targets = [];
    if (!isRandom && round == 0) {
      targets = firstRoundTargets();
    } else if (!isRandom && round == 1) {
      targets = secondRoundTargets();
    } else {
      targets = randomTargets(n);
    }

    async.map(targets, function (t, cb) {
      var url = format('http://localhost:%d/?path=%s&msg=%s&n=%s', 8000 + t, query.path + '->' + t, query.msg, query.n);
      request(url, function (err, resp, body) {
        if (err) {
          cb(err);
        } else if (resp.statusCode != 200) {
          cb('Code is ' + resp.statusCode);
        } else {
          cb();
        }
      });
    }, function (err) {
      if (err) {
        console.log(id, 'request err', err);
      }
    });
  }
  res.end('ok');
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000 + id, function () {
  console.log('server started', 8000 + id);
});
