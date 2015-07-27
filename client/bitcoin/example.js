var bitcoin = require('bitcoin');
var assert = require('assert');

var client = new bitcoin.Client({
  host: 'localhost',
  port: 9322,
  user: 'infinitecoinrpc',
  pass: 'Xp7GijrDdRW6sw5LSSiXnDsoE7fTHic9aLAGXYjJZJL',
  timeout: 3000
});

client.getBalance('*', 6, function(err, balance, resHeaders) {
  if (err) return console.log(err);
  console.log('balance:', balance);
});

client.getDifficulty(function(err, difficulty) {
  assert.ifError(err);
  assert.ok(typeof difficulty === 'number');
  console.log('difficulty: ', difficulty);
});

//client.cmd('help', function(err, commandList) {
  //assert.ifError(err);
  //console.log('commandList', commandList);
//});

//client.getNewAddress(function(err, result) {
  //if (err) {
    //return console.log(err);
  //}
  //console.log('getNewAddress', result);
//});

client.getAccount('iBXLPLNULq8KaXvxMTaTvYCJuLTSZH85Vr', function(err, result) {
  if (err) {
    return console.log(err);
  }
  console.log('account', result);
});

//client.walletPassphrase('shanqing', 100, function(err) {
  //if (err) {
    //console.log('walletPassphrase error', err);
    //return;
  //}
  //console.log('walletPassphrase success');
//});
