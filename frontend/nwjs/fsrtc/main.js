process.setting = {
  init: false,
  selectCamera: '',
  selectMic: '',
  cameraOptions: [],
  micOptions: [],
  webApiHost: '192.168.3.4',
  fsVertoHost: '192.168.2.3',
  useStun: true,
}

process.user = {
  username: '',
  password: '',
  normalizedRoomId: '',
  callerId: '',
  fsNormalConferenceId: '',
  fsScreenConferenceId: '',
  isModerator: false,
  displayName: '',
}

process.room = {
  members: [],
  chatMessages: [],
}

process.clearRoomMember = function() {
  process.room.members = [];
}

// TODO(qingfeng) use hash table instead of array
process.addRoomMember = function(key, data) {
  process.room.members.push({
    key: key,
    seq: data[0],
    id: data[1],
    name: data[2],
    codec: data[3],
    status: data[4],
  });
}

process.updateRoomMember = function(key, data) {
  for (var i in process.room.members) {
    var member = process.room.members[i];
    if (member.key === key) {
      member.status = data[4];
      break;
    }
  }
}

process.removeRoomMember = function(key) {
  for (var i in process.room.members) {
    if (process.room.members[i].key === key) {
      process.room.members.splice(i, 1);
      break;
    }
  }
}

process.askForAnonymousAccount = function(option, callback) {
  if (option && option.joinRoomId) {
    process.user.normalizedRoomId = option.joinRoomId;
  }
  process.user.username = 'qingfeng';
  process.user.password = '1234';
  process.user.normalizedRoomId = '000-123-4567';
  if (process.user.isModerator) {
    process.user.callerId = '1019';
  } else {
    process.user.callerId = '1008';
  }
  process.user.fsNormalConferenceId = '3600';
  process.user.fsScreenConferenceId = '3600-screen';
  callback(null);
}
