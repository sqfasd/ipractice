module.exports = {
  template: require('./template.html'),
  el: '#app',
  data: {
    currentView: ''
  },
  components: {
    'login': require('../login'),
    'panel': require('../panel'),
    'chat': require('../chat')
  }
}
