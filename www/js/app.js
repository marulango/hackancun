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
  var videoHeight = 270
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

  function drawPart (context, src, point1, point2, scale, offsetX, offsetY) {
    var image = new Image()
    image.src = src
    var angle = Math.atan((point1[1] - point2[1]) / (point1[0] - point2[0]))
    var width = Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
    width = width * scale
    var height = Math.abs(image.height * width / image.width)
    var centerPoint = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2]
    var offsetXpx = width * offsetX
    var offsetYpx = height * offsetY
    rotateAndPaintImage(context, image, angle, centerPoint[0], centerPoint[1], width / 2 + offsetXpx, height / 2 + offsetYpx, width, height)
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
    var tonatiuh = [
      {
        src: 'img/dientes-abajo-tonatiuh.png',
        point1: positions[54],
        point2: positions[52],
        scale: 2.5,
        offsetX: 0,
        offsetY: -0.2
      },
      {
        src: 'img/dientes-arriba-tonatiuh.png',
        point1: positions[45],
        point2: positions[49],
        scale: 2,
        offsetX: 0,
        offsetY: 0
      },
      {
        src: 'img/ojos-tonatiuh.png',
        point1: positions[23],
        point2: positions[28],
        scale: 1,
        offsetX: 0,
        offsetY: 0
      },
      {
        src: 'img/nariz-tonatiuh.png',
        point1: positions[35],
        point2: positions[39],
        scale: 2,
        offsetX: 0,
        offsetY: 0.25
      },
      {
        src: 'img/tocado-tonatiuh.png',
        point1: positions[1],
        point2: positions[13],
        scale: 1.7,
        offsetX: 0,
        offsetY: 0
      }
    ]
    tonatiuh.forEach(function (part) {
      drawPart(overlayCC, part.src, part.point1, part.point2, part.scale, part.offsetX, part.offsetY)
    })
    var mustache = new Image()
    mustache.src = 'img/hidalgo.png'
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
