var Vue = require('vue');
var Router = require('director').Router;
var app = new Vue(require('./views/app'));
var router = new Router();

router.on('/login', function (page) {
  window.scrollTo(0, 0);
  app.currentView = 'login';
  // app.params.page = +page
});

router.on('/panel', function (id) {
  window.scrollTo(0, 0);
  app.currentView = 'panel';
});

router.on('/chat', function (id) {
  window.scrollTo(0, 0);
  app.currentView = 'chat';
});

router.configure({
  notfound: function () {
    router.setRoute('/login');
  }
});

router.init('/login');
