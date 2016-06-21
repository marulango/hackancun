/* global Image */
function app () {
  var vid = document.querySelector('.videoel')
  var overlay = document.querySelector('.overlay')
  var overlayCC = overlay.getContext('2d')
  var results = document.querySelector('.results')
  var resultsCC = results.getContext('2d')
  var startButton = document.querySelector('.startbutton')
  var saveButton = document.querySelector('.savebutton')
  var container = document.querySelector('.container')
  var resultImage = document.querySelector('.resultimage')
  var cancelButton = document.querySelector('.cancelbutton')
  var videoWidth = 360
  var videoHeight = 480
  var stream

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
  window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL

  var ctrack = new window.clm.tracker({useWebGL : true}) // eslint-disable-line
  ctrack.init(window.pModel)

  // check for camerasupport
  if (!navigator.getUserMedia) {
    window.alert('Your browser does not seem to support getUserMedia.')
    return
  }

  navigator.getUserMedia({
    video: {width: {max: videoWidth}, height: {max: videoHeight}}
  }, onUserMediaSuccess, onUserMediaError)

  vid.addEventListener('canplay', canDetect, false)
  startButton.addEventListener('click', startDetecting, false)
  saveButton.addEventListener('click', saveImage, false)
  cancelButton.addEventListener('click', cancel, false)

  function canDetect () {
    startButton.innerText = 'start'
    startButton.disabled = null
    setState('camera')
  }

  function startDetecting () {
    ctrack.start(vid)
    setState('detecting')
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
    overlayCC.clearRect(0, 0, videoWidth, videoHeight)
    // psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4)
    var positions = ctrack.getCurrentPosition()
    if (!positions) {
      return
    }
    // ctrack.draw(overlay)
    var mustache = new Image()
    mustache.src = '/img/hidalgo.png'
    var mustachePoint = positions[62]
    var newWidth = Math.sqrt(Math.pow(positions[1][0] - positions[13][0], 2) + Math.pow(positions[1][1] - positions[13][1], 2))
    newWidth = newWidth * 1.5
    var newHeight = Math.abs(mustache.height * newWidth / mustache.width)
    var angle = Math.atan((positions[1][1] - positions[13][1]) / (positions[1][0] - positions[13][0]))

    rotateAndPaintImage(overlayCC, mustache, angle, mustachePoint[0], mustachePoint[1], newWidth / 2, newHeight / 2, newWidth, newHeight)
  }

  function onUserMediaSuccess (videoStream) {
    if (vid.mozCaptureStream) {
      stream = videoStream
      vid.mozSrcObject = stream
    } else {
      stream = (window.URL && window.URL.createObjectURL(videoStream)) || videoStream
      vid.src = stream
    }

    saveButton.innerText = 'Save image'
    saveButton.disabled = null
    vid.play()
  }

  function onUserMediaError () {
    window.alert('User media error.')
  }

  function saveImage () {
    if (!stream) {
      console.error('saving image when theres no stream')
      return
    }

    setState('preview')

    resultsCC.drawImage(vid, 0, 0, videoWidth, videoHeight)
    resultsCC.drawImage(overlay, 0, 0, videoWidth, videoHeight)
    ctrack.stop()

    results.toBlob(function cb (blob) {
      var url = window.URL.createObjectURL(blob)
      resultImage.src = url
    }, 'image/jpeg', 90)
  }

  function cancel () {
    vid.play()
    ctrack.start()
    setState('detecting')
  }

  function setState (state) {
    container.className = 'container ' + state
  }
}

if (window.cordova) {
  document.addEventListener('deviceready', app, false)
} else {
  app()
}
