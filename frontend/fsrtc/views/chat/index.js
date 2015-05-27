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
  methods: {
    onSend: function(e) {
      this.textMessages.push({
        id: 3,
        from: 'self',
        body: 'message body'
      });
    }
  }
}
