module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      roomList: [{
        id: "3600",
        level: '1'
      }, {
        id: "3500",
        level: '2'
      }, {
        id: "3501",
        level: '3'
      }, {
        id: "3502",
        level: '4'
      }, ],
    }
  },
  compiled: function() {
    this.roomList.push({
      id: "3700",
      level: '5'
    });
  },
  method: {
    onSubmit: function(e) {
      console.log(e);
    }
  }
}
