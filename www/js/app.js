/* global Image, clm, pModel */
function init () {
  var vid = document.getElementById('videoel')
  var overlay = document.getElementById('overlay')
  var overlayCC = overlay.getContext('2d')

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
  window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL

  var ctrack = new clm.tracker({useWebGL : true}) // eslint-disable-line
  ctrack.init(pModel)

  function enablestart () {
    var startbutton = document.getElementById('startbutton')
    startbutton.innerText = 'start'
    startbutton.disabled = null
  }

  function startVideo () {
    // start video
    vid.play()
    // start tracking
    ctrack.start(vid)
    // start loop to draw face
    drawLoop()
  }

  function rotateAndPaintImage (context, image, angleInRad, positionX, positionY, axisX, axisY, width, height) {
    context.translate(positionX, positionY)
    context.rotate(angleInRad)
    context.drawImage(image, -axisX, -axisY, width, height)
    context.rotate(-angleInRad)
    context.translate(-positionX, -positionY)
  }

  function drawLoop () {
    window.requestAnimFrame(drawLoop)
    overlayCC.clearRect(0, 0, 400, 300)
    // psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4)
    var positions = ctrack.getCurrentPosition()
    if (positions) {
      // ctrack.draw(overlay)
      var mustache = new Image()
      mustache.src = '/img/mustache.png'
      var mustachePoint = [(positions[50][0] + positions[44][0]) / 2, (positions[50][1] + positions[44][1]) / 2]
      var newWidth = Math.sqrt(Math.pow(positions[50][0] - positions[44][0], 2) + Math.pow(positions[50][1] - positions[44][1], 2))
      var newHeight = Math.abs(mustache.height * newWidth / mustache.width)
      var angle = Math.atan((positions[44][1] - positions[50][1]) / (positions[44][0] - positions[50][0]))

      rotateAndPaintImage(overlayCC, mustache, angle, mustachePoint[0], mustachePoint[1], newWidth / 2, newHeight * 2, newWidth, newHeight)

      // var noseMouthDiff = Math.abs(positions[47][1] - positions[37][1])
      // var newWidth = Math.sqrt(Math.pow(positions[50][0] - positions[44][0],2)+Math.pow(positions[50][1] - positions[44][1],2))
      // var newHeight = Math.abs(mustache.height * newWidth / mustache.width)
      // var angle = Math.atan((positions[44][1] - positions[50][1])/(positions[44][0] - positions[50][0]))
      // overlayCC.translate(positions[44][0], positions[44][1] - noseMouthDiff)
      // overlayCC.rotate(angle)
      // overlayCC.drawImage(
      //   mustache,
      //   0,
      //   0,
      //   newWidth,
      //   newHeight
      // )
      // overlayCC.rotate(-angle)
      // overlayCC.translate(-positions[44][0], -(positions[44][1] - noseMouthDiff))
    }
  }

  // check for camerasupport
  if (navigator.getUserMedia) {
    // set up stream

    var videoSelector = {video: true}

    navigator.getUserMedia(videoSelector, function (stream) {
      if (vid.mozCaptureStream) {
        vid.mozSrcObject = stream
      } else {
        vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream
      }
      vid.play()
    }, function () {
      window.insertAltVideo(vid)
      document.getElementById('gum').className = 'hide'
      document.getElementById('nogum').className = 'nohide'
      window.alert('There was some problem trying to fetch video from your webcam, using a fallback video instead.')
    })
  } else {
    window.insertAltVideo(vid)
    document.getElementById('gum').className = 'hide'
    document.getElementById('nogum').className = 'nohide'
    window.alert('Your browser does not seem to support getUserMedia, using a fallback video instead.')
  }

  vid.addEventListener('canplay', enablestart, false)
  document.getElementById('startbutton').addEventListener('click', startVideo, false)
}

if (window.cordova) {
  document.addEventListener('deviceready', init, false)
} else {
  init()
}
