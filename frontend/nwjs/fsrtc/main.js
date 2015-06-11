process.setting = {
  init: false,
  selectCamera: '',
  selectMic: '',
  cameraOptions: [],
  micOptions: [],
  webApiHost: '192.168.3.4',
  fsVertoHost: '192.168.3.4',
  useStun: true,
}

process.user = {
  username: '',
  password: '',
  normalizedRoomId: '',
  fsUserID: '',
  fsPassword: '',
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

process.initAccountInfo = function(account) {
  // process.user.username = 'qingfeng';
  // process.user.password = '1234';
  process.user.normalizedRoomId = account.room_id;
  process.user.fsUserID = account.call_id;
  process.user.fsPassword = account.pass;
  process.user.fsNormalConferenceId = account.room_id + '-normal';
  process.user.fsScreenConferenceId = account.room_id + '-screen';
}

process.setJoinRoomId = function(roomId) {
  process.user.normalizedRoomId = roomId;
  process.user.fsNormalConferenceId = roomId + '-normal';
  process.user.fsScreenConferenceId = roomId + '-screen';
}
