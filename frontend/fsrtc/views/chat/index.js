var verto = require('../../lib/verto');

function initMenu() {
}

// var remote = requireEx('remote');
module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      inputMsg: '',
      msgList: [],
      roomMembers: [],
    }
  },
  attached: function() {
    verto.call(this.params.roomId);
    this.roomMembers.push({
      name: 'peili',
      light: true
    });
    this.roomMembers.push({
      name: 'yanyi',
      light: true
    });
    this.roomMembers.push({
      name: 'qingfeng',
      light: true
    });
    this.roomMembers.push({
      name: 'guoli',
      light: false
    });
    initMenu();
  },
  methods: {
    send: function(e) {
      console.log(this.params.roomId);
      this.msgList.push({
        from: 'me',
        body: this.inputMsg
      });
      $('#msgBox').animate({
        "scrollTop": $('#msgBox')[0].scrollHeight
      }, "fast");
    },
  }
}
