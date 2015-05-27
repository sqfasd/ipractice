module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      name: '',
      passwd: ''
    }
  },
  methods: {
    onSubmit: function(e) {
      this.params.name = this.name;
      console.log(this.params.name);
      window.location.href = '#panel';
    }
  }
}
