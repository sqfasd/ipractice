require(['jquery', 'ProtoBuf'], function($, ProtoBuf) {
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
      var canvas = document.getElementById("whiteboardCanvas");
      canvas.width = 1024;
      canvas.height = 768;
      var ctx = canvas.getContext("2d");
      for (var i in cmds) {
        var cmd = cmds[i];
        console.log(cmd);
        switch (cmd.type) {
          case WBCmd.Type.Page:
            break;
          case WBCmd.Type.Backgroud:
            break;
          case WBCmd.Type.Style:
            break;
          case WBCmd.Type.Stroke:
            var points = cmd.stroke.points;
            ctx.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; ++i) {
              ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
            break;
          case WBCmd.Type.Playback:
            break;
          case WBCmd.Type.Undo:
            break;
          case WBCmd.Type.Clean:
            break;
          case WBCmd.Type.Pen:
            break;
          case WBCmd.Type.Text:
            break;
          case WBCmd.Type.Image:
            break;
          case WBCmd.Type.Header:
            break;
        }
      }
    });
  });
});
