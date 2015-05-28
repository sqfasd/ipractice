var user = require('./user');

var host = '192.168.2.3';
var wssUrl = 'wss://' + host + ':8082';
var useStun = true;

var gOptions = {
  host: host,
  wssUrl: wssUrl,
  useStun: true,
  localVideoTag: '',
  videoTag: '',
  videoParams: {
    minWidth: 320,
    minHeight: 240,
    maxWidth: 1920,
    maxHeight: 1080,
  }
};
var gVerto = null;
var gCurrentCall = null;
var gInited = false;

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
    gOptions = $.extend(gOptions, options);
    console.log('verto init options', gOptions);
  },

  login: function() {
    if (!gInited) {
      $.verto.init({}, function() {
        gVerto = new $.verto({
          login: user.id,
          passwd: user.passwd,
          socketUrl: gOptions.wssUrl,
          tag: gOptions.videoTag,
          localTag: gOptions.localVideoTag,
          videoParams: gOptions.videoParams,
          iceServers: gOptions.useStun,
        }, defaultCallbacks);
        gVerto.login();
      });
    } else {
      gVerto.login();
    }
  },

  call: function() {
    console.log('verto.newCall options', options);
    cur_call = verto.newCall($.extend({
      destination_number: '',
      caller_id_name: user.name,
      caller_id_number: user.id,
      useVideo: true,
      useStereo: true,
      useCamera: $.verto.videoDevices.length > 0 ? $.verto.videoDevices[0] : '',
      useMic: $.verto.audioDevices.length > 0 ? $.verto.audioDevices[0] : ''
    }, options));
  },

  videoDevices: function() {
    return $.verto.videoDevices;
  },
  audioDevices: function() {
    return $.verto.audioDevices;
  },
}

function call_() {
  navigator.webkitGetUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'screen',
          maxWidth: 1280,
          maxHeight: 720
        },
        optional: []
      }
    },
    function(stream) {
      document.getElementById('localVideo').src = URL.createObjectURL(stream);
    },
    function(e) {
      console.log('could not connect stream', e);
    }
  );
}
