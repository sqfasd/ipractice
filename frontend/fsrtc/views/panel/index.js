module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      ownerRooms: [
        "3500",
        "3600"
      ],
      otherRooms: [
        "3501",
        "3601"
      ]
    }
  },
  compiled: function() {
    this.ownerRooms.push("3700");
  },
  method: {
    onSubmit: function(e) {
      console.log(e);
    }
  }
}
