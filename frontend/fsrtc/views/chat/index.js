module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      textMessages: [{
        id: 1,
        from: 'self',
        body: 'message body'
      },{
        id: 2,
        from: 'self',
        body: 'message body 2'
      }
      ]
    }
  },
  attached: function() {
    require('../../lib/verto').call(this.params.roomId);
  },
  methods: {
    onSend: function(e) {
      console.log(this.params.roomId);
      this.textMessages.push({
        id: 3,
        from: 'self',
        body: 'message body'
      });
    }
  }
}
