var redis = require('redis');

var client = redis.createClient(6379, '127.0.0.1');
var isReady = false;
client.on('ready', function(arg) {
  console.log('redis client on ready', arg);
  isReady = true;
});
client.on('error', function(err) {
  console.log('redis client on error', err);
  isReady = false;
});
client.on('close', function(err) {
  console.log('redis client on close', err);
  isReady = false;
});

function runScript(id, params) {
  client.eval(params, function(err, result) {
    if (err) {
      console.error(`eval ${id} error: ${err}`);
    } else {
      console.log(`eval ${id} result: ${result}`);
    }
  })
}

var script = `
  local value = redis.call('get', KEYS[1])
  if value then
    redis.call('set', KEYS[1], ARGV[1])
  end
  redis.call('set', KEYS[1], ARGV[1])
  return redis.call('get', KEYS[1])
`;

runScript(1, [script, 1, 'testkey', 'testvalue']);
