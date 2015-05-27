module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      name: '',
      passwd: ''
    }
  },
  method: {
    onSubmit: function(e) {
      console.log(e);
    }
  }
}
