require(['jquery', 'ProtoBuf'], function($, ProtoBuf) {
  var c=document.getElementById("whiteboardCanvas");
  var cxt=c.getContext("2d");
  cxt.moveTo(10,10);
  cxt.lineTo(150,50);
  cxt.lineTo(10,50);
  cxt.stroke();

  ProtoBuf.loadProtoFile("/proto/WBCmd.proto", function(err, builder) {
    if (err) {
      console.log('loadProtoFile error', err);
      return;
    }
    var WBCmd = builder.build('WBCmd');
    $.get('/data/pager/index.wbf2', function(content) {
      var lines = content.split('\n');
      var cmds = [];
      for (var i in lines) {
        var line = lines[i].replace(/(^\s*)|(\s*$)/g, '');
        if (line) {
          console.log('line=[%s]', line);
          cmds.push(WBCmd.decode64(line));
        }
      }
      console.log(cmds);
    });
  });
});
