var request = require('request');

if (process.argv.length != 5) {
  console.log('node client.js <n> <label> <random>');
  return;
}

var n = process.argv[2];
var msg = process.argv[3];
var random = process.argv[4];

var url = 'http://localhost:8000';
url += '?path=' + 0;
url += '&msg=' + msg;
url += '&n=' + n;
url += '&random=' + random;
console.log(url);
request(url, function (err, resp, body) {
  if (err) {
    console.log('Error: ', err);
  } else if (resp.statusCode != 200) {
    console.log('Status: ', resp.statusCode);
  } else {
    console.log(body);
  }
});
