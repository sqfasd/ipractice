var host = '192.168.1.113';
var wssUrl = 'wss://' + host + ':8082';
var useStun = true;

var verto = null;
var cur_call = null;

var callbacks = {
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

function refreshDevices() {
  console.log('refreshDevices');
  $("#usecamera").selectmenu({});
  $("#usecamera").selectmenu("enable");
  $("#usecamera").empty();

  $("#usemic").selectmenu({});
  $("#usemic").selectmenu("enable");
  $("#usemic").empty();

  $("#usecamera").append(new Option("No camera", "none"));
  for (var i in $.verto.videoDevices) {
    var device = $.verto.videoDevices[i];
    $("#usecamera").append(new Option(device.label, device.id));
  }

  $("#usemic").append(new Option("No mic", "none"));
  for (var i in $.verto.audioDevices) {
    var device = $.verto.audioDevices[i];
    $("#usemic").append(new Option(device.label, device.id));
  }
  $("#usecamera").selectmenu('refresh', true);
  $("#usemic").selectmenu('refresh', true);
}

function init() {
  console.log('init');
  $.verto.init({}, init2);
}

function init2() {
  verto = new $.verto({
    login: $("#name").val(),
    passwd: $("#password").val(),
    socketUrl: wssUrl,
    tag: "remoteVideo",
    // localTag: "localVideo",
    videoParams: {
      minWidth: 320,
      minHeight: 240,
      maxWidth: 1920,
      maxHeight: 1080,
    },
    iceServers: useStun,
  }, callbacks);
  refreshDevices();
}

function login() {
  console.log('login');
  verto.loginData({
    login: $("#name").val(),
    passwd: $("#password").val(),
  });
  verto.login();
}

function call() {
  var options = {
    destination_number: $("#roomid").val(),
    caller_id_name: $("#nickname").val(),
    caller_id_number: $("#cid").val(),
    useVideo: true,
    useStereo: true,
    useCamera: $("#usecamera").find(":selected").val(),
    useMic: $("#usemic").find(":selected").val(),
  };
  console.log('verto.newCall options', options);
  cur_call = verto.newCall(options);
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
