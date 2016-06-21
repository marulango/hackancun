/* global Image, clm, pModel */
function app () {
  var vid = document.querySelector('.videoel')
  var overlay = document.querySelector('.overlay')
  var overlayCC = overlay.getContext('2d')
  var results = document.querySelector('.results')
  var resultsCC = results.getContext('2d')
  var startButton = document.querySelector('.startbutton')
  var saveButton = document.querySelector('.savebutton')
  var videoWidth = 411
  var videoHeight = 308
  var stream

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
  window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL

  var ctrack = new clm.tracker({useWebGL : true}) // eslint-disable-line
  ctrack.init(pModel)

  // check for camerasupport
  if (!navigator.getUserMedia) {
    window.insertAltVideo(vid)
    document.getElementById('gum').className = 'hide'
    document.getElementById('nogum').className = 'nohide'
    window.alert('Your browser does not seem to support getUserMedia, using a fallback video instead.')
  }

  navigator.getUserMedia({
    video: {width: {max: videoWidth}, height: {max: videoHeight}}
  }, onUserMediaSuccess, onUserMediaError)

  vid.addEventListener('canplay', enablestart, false)
  startButton.addEventListener('click', startVideo, false)
  saveButton.addEventListener('click', saveImage, false)

  function enablestart () {
    startButton.innerText = 'start'
    startButton.disabled = null
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
    overlayCC.clearRect(0, 0, videoWidth, videoHeight)
    // psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4)
    var positions = ctrack.getCurrentPosition()
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
    window.insertAltVideo(vid)
    document.getElementById('gum').className = 'hide'
    document.getElementById('nogum').className = 'nohide'
    window.alert('There was some problem trying to fetch video from your webcam, using a fallback video instead.')
  }

  function saveImage () {
    if (!stream) {
      console.error('saving image when theres no stream')
      return
    }

    resultsCC.drawImage(vid, 0, 0, videoWidth, videoHeight)
    resultsCC.drawImage(overlay, 0, 0, videoWidth, videoHeight)

    var dataurl = results.toBlob(function cb (blob) {
      var image = document.createElement('img')
      var url = window.URL.createObjectURL(blob)
      image.src = url
      document.body.appendChild(image)
    }, 'image/jpeg', 90)
    console.log(dataurl)
  }
}

if (window.cordova) {
  document.addEventListener('deviceready', app, false)
} else {
  app()
}
