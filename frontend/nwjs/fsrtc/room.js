var gui = require('nw.gui');

function connectToRoom() {}

function getVertoWssUrl() {
  return 'wss://' + process.setting.fsVertoHost + ':8082';
}

function getVideoParams() {
  return {
    minWidth: 320,
    minHeight: 240,
    maxWidth: 1920,
    maxHeight: 1080,
  };
}

function addMember(memberData) {
  process.members.push(memberData);
}

function addChatMessage(data) {
  process.chatMessages.push({
    from: data.from_msg_name || data.from,
    body: data.body,
  });
}

function RoomManager(ldData, callID, verto) {
  this.subscribeId = null;
  this.ldData = ldData;
  this.callID = callID;
  this.verto = verto;
  this._init();
}

RoomManager.prototype._init = function() {
  this.subscribeId = verto.subscribe(ldData.laChannel, {
    handler: this._eventHandler,
    userData: this,
    subParams: {
      callID: callID,
    },
  });
}

RoomManager.prototype._eventHandler = function(v, e, la) {
  console.log('_eventHandler', v, e, la);
  var packet = e.data;
  if (packet.name != la.name) {
    return;
  }
  switch (packet.action) {
    case "init":
      la.init(packet.wireSerno, packet.data, packet.hashKey, packet.arrIndex);
      break;
    case "bootObj":
      la.bootObj(packet.wireSerno, packet.data);
      break;
    case "add":
      la.add(packet.wireSerno, packet.data, packet.hashKey, packet.arrIndex);
      break;
    case "modify":
      if (!(packet.arrIndex || packet.hashKey)) {
        console.error("Invalid Packet", packet);
      } else {
        la.modify(packet.wireSerno, packet.data, packet.hashKey, packet.arrIndex);
      }
      break;
    case "del":
      if (!(packet.arrIndex || packet.hashKey)) {
        console.error("Invalid Packet", packet);
      } else {
        la.del(packet.wireSerno, packet.hashKey, packet.arrIndex);
      }
      break;
    case "clear":
      la.clear();
      break;
    case "reorder":
      la.reorder(packet.wireSerno, packet.order);
      break;
    default:
      if (la.checkSerno(packet.wireSerno)) {
        if (la.onChange) {
          la.onChange(la, {
            serno: packet.wireSerno,
            action: packet.action,
            data: packet.data
          });
        }
      }
      break;
  }
}

RoomManager.prototype.destroy = function() {}

var gVerto = null;
var gView = null;
var gRoomManager = null;
var vertoCallbacks = {
  onMessage: function(verto, dialog, msg, data) {
    console.log('onMessage', msg, data);
    switch (msg) {
      case $.verto.enum.message.pvtEvent:
        if (data.pvtEvent) {
          switch (data.pvtEvent.action) {
            case "conference-liveArray-part":
              if (gRoomManager) {
                gRoomManager.destroy();
                gRoomManager = null;
              }
              break;
            case "conference-liveArray-join":
              if (gRoomManager) {
                gRoomManager.destroy();
              }
              gRoomManager = new RoomManager(data.pvtData, dialog.callID);
              break;
          }
        }
        break;
      case $.verto.enum.message.info:
        addChatMessage(data);
        break;
      case $.verto.enum.message.display:
        break;
      default:
        break;
    }
  },
  onDialogState: function(d) {
    console.log('onDialogState', d);
    // TODO(qingfeng) process share call and private call
    switch (d.state) {
      case $.verto.enum.state.early:
      case $.verto.enum.state.active:
        gView.statusText = 'connected';
        break;
      case $.verto.enum.state.destroy:
        break;
    }
  },
  onWSLogin: function(v, success) {
    console.log('onWSLogin', success);
    if (!gVerto) {
      alert('gVerto should not be null!');
      gui.Window.get().close();
      return;
    }
    var options = {
      destination_number: process.user.fsNormalConferenceId,
      caller_id_name: process.user.displayName,
      caller_id_number: process.user.callerId,
      useVideo: true,
      useStereo: true,
      useCamera: process.setting.selectCamera,
      useMic: process.setting.selectMic,
    };
    if (!process.setting.selectCamera || !process.setting.selectMic) {}
    console.log('newCall options', options);
    gVerto.newCall(options);
  },
  onWSClose: function(v, success) {
    console.log('onWSClose', success);
  },
  onEvent: function(v, e) {
    console.log('onEvent', e);
  },
};

window.onload = function() {
  gView = new Vue({
    el: '#room',
    data: {
      statusText: 'connecting',
    },
    compiled: function() {},
    ready: function() {
      $.verto.init({}, function() {
        gVerto = new $.verto({
          login: process.user.callerId,
          passwd: process.user.password,
          socketUrl: getVertoWssUrl(),
          tag: 'mosaicGridVideo',
          videoParams: getVideoParams(),
          iceServers: process.setting.useStun,
        }, vertoCallbacks);
        gVerto.login();
      });
    },
    methods: {}
  });
}
