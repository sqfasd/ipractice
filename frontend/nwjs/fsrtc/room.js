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

function addChatMessage(data) {
  process.room.chatMessages.push({
    from: data.from_msg_name || data.from,
    body: data.body,
  });
}

function RoomManager(laData, callID, verto) {
  this.subscribeId = null;
  this.laData = laData; // live-array data
  this.callID = callID;
  this.verto = verto;
  this._init();
}

RoomManager.prototype._init = function() {
  var eventHandler = function(verto, e, self) {
    var packet = e.data;
    console.log('eventHandler packet', packet);
    if (packet.name != self.laData.laName) {
      console.warn('name not matched with this room');
      return;
    }
    // TODO(qingfeng) process exception, while error occured, use bootstrap
    switch (packet.action) {
      case "init":
        break;
      case "bootObj":
        process.clearRoomMember();
        for (var i = 0; i < packet.data.length; ++i) {
          var key = packet.data[i][0];
          var data = packet.data[i][1];
          process.addRoomMember(key, data);
        }
        break;
      case "add":
        process.addRoomMember(packet.hashKey, packet.data);
        break;
      case "modify":
        process.updateRoomMember(packet.hashKey, packet.data);
        break;
      case "del":
        process.removeRoomMember(packet.hashKey);
        break;
      case "clear":
        process.clearRoomMember();
        break;
      case "reorder":
        console.warn('receive reorder action');
        break;
      default:
        console.warn('unexpected room event');
        break;
    }
  }
  this.subscribeId = this.verto.subscribe(this.laData.laChannel, {
    handler: eventHandler,
    userData: this,
    subParams: {
      callID: this.callID,
    },
  });
  console.log('subscribeId', this.subscribeId);
  this.sendCommand('bootstrap');
}

RoomManager.prototype.sendCommand = function(cmd, obj) {
  var channel = this.laData.laChannel;
  var name = this.laData.laName;
  this.verto.broadcast(channel, {
    liveArray: {
      command: cmd,
      context: channel,
      name: name,
      obj: obj
    }
  });
}

RoomManager.prototype.destroy = function() {
  this.verto.unsubscribe(this.subscribeId);
}

var gVerto = null;
var gNormalCall = null;
var gScreenCall = null;
var gView = null;
var gRoomManager = null;
var gIsShareScreenInitiator = false;
var vertoCallbacks = {
  onMessage: function(verto, dialog, msg, data) {
    console.log('onMessage', msg, data);
    switch (msg) {
      case $.verto.enum.message.pvtEvent:
        if (data.pvtData) {
          switch (data.pvtData.action) {
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
              gRoomManager = new RoomManager(
                data.pvtData,
                dialog ? dialog.callID : null,
                verto);
              break;
          }
        }
        break;
      case $.verto.enum.message.info:
        if (data.body === '#SHARE_SCREEN' && !gIsShareScreenInitiator) {
          acceptShareCall();
        }
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
        gView.status = 'connected';
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
      caller_id_number: process.user.fsUserID,
      useVideo: true,
      useStereo: true,
      useCamera: process.setting.selectCamera,
      useMic: process.setting.selectMic,
    };
    console.log('newCall options', options);
    gNormalCall = gVerto.newCall(options);
  },
  onWSClose: function(v, success) {
    console.log('onWSClose', success);
  },
  onEvent: function(v, e) {
    console.log('onEvent', e);
  },
};

function hangupVerto() {
  if (gVerto) {
    gVerto.hangup();
    gVerto = null;
  }
}

function broadcastShareScreenEvent() {
  gIsShareScreenInitiator = true;
  gNormalCall.message({
    to: gRoomManager.laData.chatID,
    body: '#SHARE_SCREEN',
  });
}

function acceptShareCall() {
  if (gScreenCall) {
    console.log('hangup current gScreenCall');
    gScreenCall.hangup();
  }
  if (!gVerto) {
    console.error('gVerto is null');
    return;
  }
  var options = {
    destination_number: process.user.fsScreenConferenceId,
    caller_id_name: process.user.displayName,
    caller_id_number: process.user.fsUserID,
    useVideo: false,
    useStereo: false,
  };
  console.log('newCall options', options);
  gScreenCall = gVerto.newCall();
  showSharedScreen();
}

window.onload = function() {
  gui.Screen.Init();
  gView = new Vue({
    el: '#room',
    data: {
      status: 'connecting',
      roomID: process.user.normalizedRoomId,
    },
    compiled: function() {},
    ready: function() {
      $.verto.init({}, function() {
        gVerto = new $.verto({
          login: process.user.fsUserID,
          passwd: process.user.fsPassword,
          socketUrl: getVertoWssUrl(),
          tag: 'mosaicGridVideo',
          videoParams: getVideoParams(),
          iceServers: process.setting.useStun,
        }, vertoCallbacks);
        gVerto.login();
      });
    },
    methods: {
      hangup: function() {
        hangupVerto();
        gui.Window.get().close();
      },
      openChat: function() {
        if (process.chatWindow) {
          console.log('process.chatWindow show');
          process.chatWindow.show();
        } else {
          process.chatWindow = gui.Window.open('chat.html', {
            focus: true,
            width: 900,
            height: 700,
          });
          process.chatWindow.on('close', function() {
            this.hide();
          });
        }
      },
      shareScreen: function() {
        console.log('shareScreen enter');
        gui.Screen.chooseDesktopMedia(["window", "screen"], function(streamId) {
          console.log('after chooseDesktopMedia', streamId);
          var options = {
            destination_number: process.user.fsScreenConferenceId,
            caller_id_name: process.user.displayName,
            caller_id_number: process.user.fsUserID,
            screenShare: true,
            useVideo: false,
            useStereo: false,
            tag: 'sharedScreenVideo',
            videoParams: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
                maxWidth: 1920,
                maxHeight: 1080
              },
              optional: [{
                googTemporalLayeredScreencast: true
              }]
            }
          };
          console.log('before share screen call', options);
          var gScreenCall = gVerto.newCall(options);
          broadcastShareScreenEvent();
          // showSharedScreen();
          gui.Window.get().unmaximize();
          gui.Window.get().resizeTo(500, 500);
        });
      }
    }
  });

  process.on('chat.channelMessage', function(msg) {
    console.log('process event chat.channelMessage', msg);
    if (!gNormalCall) {
      console.error('gNormalCall is null, send message failed');
      return;
    }
    if (!gRoomManager) {
      console.log('gRoomManager is null, send message failed');
      return;
    }

    gNormalCall.message({
      to: gRoomManager.laData.chatID,
      body: msg,
    });
  });
}

gui.Window.get().on('close', function() {
  hangupVerto();
  if (process.chatWindow) {
    process.chatWindow.close(true);
  }
  this.close(true);
  process.mainWindow.show();
});
