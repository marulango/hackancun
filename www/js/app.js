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
  var stampButton = document.querySelector('.stampbutton')
  var videoWidth = 360
  var videoHeight = 270
  var stream
  var imageBlob

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
  saveButton.addEventListener('click', previewImage, false)
  cancelButton.addEventListener('click', cancelPreview, false)
  stampButton.addEventListener('click', stamp, false)

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

  function previewImage () {
    if (!stream) {
      console.error('saving image when theres no stream')
      return
    }

    setState('preview')

    resultsCC.drawImage(vid, 0, 0, videoWidth, videoHeight)
    resultsCC.drawImage(overlay, 0, 0, videoWidth, videoHeight)
    ctrack.stop()

    results.toBlob(function cb (blob) {
      imageBlob = blob
      var url = window.URL.createObjectURL(imageBlob)
      resultImage.src = url
    }, 'image/jpeg', 90)
  }

  function cancelPreview () {
    vid.play()
    ctrack.start()
    setState('detecting')
  }

  function stamp () {
    if (!(window.cordova && window.cordova.file)) {
      return
    }

    function callback (err, fileEntry) {
      if (err) {
        console.error('err')
      }
      // this is the complete list of currently supported params you can pass to the plugin (all optional)
      var options = {
        message: '#Tonatiuh era responsable de soportar el universo. Para prevenir el fin del mundo, los Aztecas creían que era esencial mantener la fuerza del dios del Sol ofreciéndole sacrificios humanos. #badAss #timeStamps', // not supported on some apps (Facebook, Instagram)
        files: [fileEntry.nativeURL], // an array of filenames either locally or remotely
        chooserTitle: 'Compartir en…' // Android only, you can override the default share sheet title
      }

      function onSuccess (result) {
        console.log('success', result)
      }

      function onError (msg) {
        console.error('Sharing failed with message: ' + msg)
      }

      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError)
    }

    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, function (fs) {
      window.resolveLocalFileSystemURL(window.cordova.file.externalRootDirectory, function (rootDirEntry) {
        rootDirEntry.getDirectory('timestamps', {create: true}, function (dirEntry) {
          dirEntry.getFile('tempImage.jpg', {
            create: true, exclusive: false
          }, function (fileEntry) {
            writeFile(fileEntry)
          }, callback)
        })
      })
    })

    function writeFile (fileEntry) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function () {
          callback(null, fileEntry)
        }

        fileWriter.onerror = function (err) {
          callback(err)
        }

        fileWriter.write(imageBlob)
      })
    }
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
