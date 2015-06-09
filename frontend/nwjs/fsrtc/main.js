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
