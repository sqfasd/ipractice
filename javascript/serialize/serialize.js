var fs = require('fs');
var async = require('async');
var ProtoBuf = require("protobufjs");
var ProtoBuf2 = require("protocol-buffers");
var PSON = require('pson');

var builder = ProtoBuf.newBuilder();
builder.define('test');
builder.create([{
  "name": "User",
  "fields": [
  {
    "rule": "required",
    "type": "string",
    "name": "name1234567",
    "id": 1,
  },
  {
    "rule": "required",
    "type": "int32",
    "name": "age1234567",
    "id": 2,
  },
  {
    "rule": "required",
    "type": "int32",
    "name": "sex1234567",
    "id": 3,
  },
  {
    "rule": "required",
    "type": "string",
    "name": "msg1234567",
    "id": 4,
  },
  ]
}]);
builder.reset();
var test = builder.build('test');
var User = test.User;

var pson = new PSON.ProgressivePair(['name1234567', 'age1234567', 'sex1234567', 'msg1234567']);

var UserProto2 = ProtoBuf2(fs.readFileSync('./user.proto'));


var input = {
  name1234567: 'shanqingfeng',
  age1234567: 27,
  sex1234567: 1,
  msg1234567: 'hello my name is ...'
};

var user = new User();
user.name1234567 = 'shanqingfeng';
user.age1234567 = 27;
user.sex1234567 = 1;
user.msg1234567 = 'hello my name is ...';

var length = 0;

function encodejson(i) {
  return JSON.stringify(i);
}

function decodejson(i) {
  return JSON.parse(i);
}

function encodepb(i) {
  return i.toBase64();
}

function decodepb(i) {
  return User.decode64(i);
}

function encodepson(i) {
  return pson.encode(i).buffer;
}

function decodepson(i) {
  return pson.decode(i);
}

function encodepb2(i) {
  return UserProto2.User.encode(i);
}

function decodepb2(i) {
  return UserProto2.User.decode(i);
}

var count = 100000;

console.time('encodejson');
for (var i = 0; i < count; i++) {
  length += encodejson(input).length;
}
console.log('encodejson total length', length);
console.timeEnd('encodejson');

var enc = encodejson(input);
console.time('decodejson');
for (var i = 0; i < count; i++) {
  decodejson(enc);
}
console.timeEnd('decodejson');

length = 0;
console.time('encodepb');
for (var i = 0; i < count; i++) {
  length += encodepb(user).length;
}
console.log('encodepb total length', length);
console.timeEnd('encodepb');

enc = encodepb(user);
console.time('decodepb');
for (var i = 0; i < count; i++) {
  decodepb(enc);
}
console.timeEnd('decodepb');

length = 0;
console.time('encodepson');
for (var i = 0; i < count; i++) {
  length += encodepson(input).length;
}
console.log('encodepson total length', length);
console.timeEnd('encodepson');

enc = encodepson(input);
console.time('decodepson');
for (var i = 0; i < count; i++) {
  decodepson(enc);
}
console.timeEnd('decodepson');

length = 0;
console.time('encodepb2');
for (var i = 0; i < count; i++) {
  length += encodepb2(input).toString('base64').length;
}
console.log('encodepb2 total length', length);
console.timeEnd('encodepb2');

enc = encodepb2(input);
console.time('decodepb2');
for (var i = 0; i < count; i++) {
  decodepb2(enc);
}
console.timeEnd('decodepb2');
