require(['jquery', 'ProtoBuf'], function($, ProtoBuf) {
  var canvas1 = document.getElementById("whiteboardCanvas1");
  var canvas2 = document.getElementById("whiteboardCanvas2");
  canvas1.width = 1024;
  canvas1.height = 768;
  canvas2.width = 1024;
  canvas2.height = 768;
  var layer1 = canvas1.getContext("2d");
  var layer2 = canvas2.getContext("2d");
  console.log('layer1 === layer2', layer1 === layer2);

  var mode = 'pen';
  var color = 'black';

  $('#blackBtn').click(function() {
    console.log('blackBtn clicked');
    color = 'black';
    mode = 'pen';
  });
  $('#redBtn').click(function() {
    console.log('redBtn clicked');
    color = 'red';
    mode = 'pen';
  });
  $('#eraserBtn').click(function() {
    console.log('eraserBtn clicked');
    mode = 'eraser';
  });

  function getPointOnCanvas(canvas, e) {
    var bbox = canvas.getBoundingClientRect();
    return {
      x: e.clientX - bbox.left * (canvas.width / bbox.width),
      y: e.clientY - bbox.top * (canvas.height / bbox.height)
    };
  }

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
            layer1.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; ++i) {
              layer1.lineTo(points[i].x, points[i].y);
            }
            layer1.stroke();
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
      canvas2.onmousedown = function (ed) {
        var downPoint = getPointOnCanvas(canvas2, ed);
        if (mode === 'pen') {
          console.log('in pen mode');
          layer2.beginPath();
          layer2.moveTo(downPoint.x, downPoint.y);
          layer2.strokeStyle = color;
          document.onmousemove = function (em) {
            var movePoint = getPointOnCanvas(canvas2, em);
            layer2.lineTo(movePoint.x, movePoint.y);
            layer2.stroke();
          };
          document.onmouseup = function () {
            layer2.closePath();
            document.onmousemove = null;
            document.onmouseup = null;
          }
        } else if (mode === 'eraser') {
          console.log('in eraser mode');
          document.onmousemove = function (em) {
            var movePoint = getPointOnCanvas(canvas2, em);
            layer2.clearRect(movePoint.x, movePoint.y, 20, 20);
          };
          document.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
          }
        }
      }
    });
  });
});
