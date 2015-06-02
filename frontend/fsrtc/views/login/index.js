var config = require('../../lib/config');
var verto = require('../../lib/verto');

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      id: '',
      passwd: '',
      serverHostName: config.serverHostName, 
    }
  },
  methods: {
    onSubmit: function(e) {
      config.id = this.id;
      config.name = this.id;
      config.passwd = this.passwd;
      config.serverHostName = this.serverHostName;
      //verto.init({});
      //verto.login();
      window.location.href = '#panel';
    }
  }
}
