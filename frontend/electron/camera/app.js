//navigator.webkitGetUserMedia({video: true},
navigator.webkitGetUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'screen',
        maxWidth: 1280,
        maxHeight: 720
      },
      optional: []
    }
  },
  function(stream) {
    document.getElementById('camera').src = URL.createObjectURL(stream);
  },
  function() {
    alert('could not connect stream');
  }
);
