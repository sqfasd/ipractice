var express = require('express');
var router = express.Router();
var mime = require('mime');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/download', function(req, res, next) {
  var content = '32804302409\r\nfdsjlkflkds\r\ndfsfdsafds';
  var filename = 'asch-key.txt';
  var mimetype = mime.lookup(filename);
  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-Length', content.length);
  res.setHeader('Content-Type', mimetype);
  res.write(content, 'binary');
  res.end();
});

module.exports = router;
