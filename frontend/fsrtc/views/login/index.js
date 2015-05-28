var user = require('../../lib/user');
var verto = require('../../lib/verto');

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      id: '',
      passwd: ''
    }
  },
  methods: {
    onSubmit: function(e) {
      user.id = this.id;
      user.name = 'test';
      user.passwd = this.passwd;
      verto.init({});
      verto.login();
      window.location.href = '#panel';
    }
  }
}
