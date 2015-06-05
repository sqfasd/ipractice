var config = require('./config');

var useStun = true;

var gOption = null;
var gVerto = null;
var gCurrentCall = null;
var gInited = false;

function getGlobalOption() {
    return {
      host: config.serverHostName,
      wssUrl: 'wss://' + config.serverHostName + ':8082',
      useStun: true,
      localVideoTag: 'localVideo',
      videoTag: 'remoteVideo',
      videoParams: {
        minWidth: 320,
        minHeight: 240,
        maxWidth: 1920,
        maxHeight: 1080,
      }
    };
}

var defaultCallbacks = {
  onMessage: function(verto, dialog, msg, data) {
    console.log('onMessage', msg, data);
    switch (msg) {
      case $.verto.enum.message.pvtEvent:
        break;
      case $.verto.enum.message.info:
        break;
      case $.verto.enum.message.display:
        break;
      default:
        break;
    }
  },
  onDialogState: function(d) {
    console.log('onDialogState', d);
  },
  onWSLogin: function(v, success) {
    console.log('onWSLogin', success);
  },
  onWSClose: function(v, success) {
    console.log('onWSClose', success);
  },
  onEvent: function(v, e) {
    console.log('onEvent', e);
  },
};

module.exports = {
  init: function(options) {
    gOptions = $.extend(getGlobalOption(), options);
    console.log('verto init options', gOptions);
  },

  login: function() {
    if (!gInited) {
      $.verto.init({}, function() {
        gVerto = new $.verto({
          login: config.id,
          passwd: config.passwd,
          socketUrl: gOptions.wssUrl,
          tag: gOptions.videoTag,
          localTag: gOptions.localVideoTag,
          videoParams: gOptions.videoParams,
          iceServers: gOptions.useStun,
        }, defaultCallbacks);
        gInited = true;
        gVerto.login();
      });
    } else {
      gVerto.login();
    }
  },

  call: function(id) {
    var options = {
      destination_number: id,
      caller_id_name: config.name,
      caller_id_number: config.id,
      useVideo: true,
      useStereo: true,
      useCamera: $.verto.videoDevices.length > 0 ? $.verto.videoDevices[0] : '',
      useMic: $.verto.audioDevices.length > 0 ? $.verto.audioDevices[0] : ''
    };
    console.log('verto.call', options);
    gCurrentCall = gVerto.newCall(options);
  },

  videoDevices: function() {
    return $.verto.videoDevices;
  },
  audioDevices: function() {
    return $.verto.audioDevices;
  },
}
