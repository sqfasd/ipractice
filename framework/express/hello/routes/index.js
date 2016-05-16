var express = require('express');
var router = express.Router();
var mime = require('mime');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var isDownloaded = false;

router.get('/download', function(req, res, next) {
  console.log('isDownloaded', isDownloaded);
  if (!isDownloaded) {
    var content = '32804302409\r\nfdsjlkflkds\r\ndfsfdsafds';
    var filename = 'asch-key.txt';
    var mimetype = mime.lookup(filename);
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-Length', content.length);
    res.setHeader('Content-Type', mimetype);
    res.write(content, 'binary');
    res.end();
    isDownloaded = true;
  } else {
    res.end('your key file has been downloaded!');
  }
});

module.exports = router;
