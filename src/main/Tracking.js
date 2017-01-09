import TrackerTask from "./TrackerTask"


export default class {

  _initUserMedia(element, opt_options) {
    window.navigator.getUserMedia({
      video: true,
      audo: !!(opt_options && opt_options.audio)
    },
    function(stream) {
      try {
        element.src = window.URL.createObjectURL(stream)
      }
      catch(error) {
        element.src = stream
      }
    },
    function() {
      throw new Error('Cannot capture user camera.')
    })
  }

  isNode(o) {
    return o.nodeType || this.isWindow(o)
  }

  isWindow(o) {
    return !!(o && o.alert && o.document)
  }

  one(selector, opt_element) {
    if (this.isNode(selector)) {
      return selector
    }
    return (opt_element || document).querySelector(selector)
  }

  track(element, tracker, opt_options) {
    element = this.one(element)
    if (!element) {
      throw new Error('Element not found, try a different element or selector.')
    }
    if (!tracker) {
      throw new Error('Tracker not specified, try `tracking.track(element, new tracking.FaceTracker())`.')
    }

    switch (element.nodeName.toLowerCase()) {
      case 'canvas':
        return this._trackCanvas(element, tracker, opt_options)
      case 'img':
        return this._trackImg(element, tracker, opt_options)
      case 'video':
        if (opt_options && opt_options.camera) {
          this._initUserMedia(element, opt_options)
        }
        return this._trackVideo(element, tracker, opt_options)
      default:
        throw new Error('Element not supported, try in a canvas, img, or video.')
    }
  }

  _trackCanvas(element, tracker) {
    const task = new tracking.TrackerTask(tracker)
    task.on('run', () => this._trackCanvasInternal(element, tracker))
    return task.run()
  }

  _trackCanvasInternal(element, tracker) {
    const width = element.width
    const height = element.height
    const context = element.getContext('2d')
    const imageData = context.getImageData(0, 0, width, height)
    tracker.track(imageData.data, width, height)
  }

  _trackImg(element, tracker) {
    const width = element.width
    const height = element.height
    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    const task = new tracking.TrackerTask(tracker)
    task.on('run', () => {
      tracking.Canvas.loadImage(canvas, element.src, 0, 0, width, height, () => {
        tracking._trackCanvasInternal(canvas, tracker)
      })
    })
    return task.run()
  }

  _trackVideo(element, tracker) {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    var width, height

    const _resizeCanvas = function() {
      width = element.offsetWidth
      height = element.offsetHeight
      canvas.width = width
      canvas.height = height
    }
    _resizeCanvas()
    element.addEventListener('resize', _resizeCanvas)

    var requestId
    const _requestAnimationFrame = function() {
      requestId = window.requestAnimationFrame(() => {
        if (element.readyState === element.HAVE_ENOUGH_DATA) {
          try {
            context.drawImage(element, 0, 0, width, height)
          }
          catch(error) {
            tracking._trackCanvasInternal(canvas, tracker)
          }
        }
        _requestAnimationFrame()
      })
    }

    const task = new TrackerTask(tracker)
    task.on('stop', () => window.cancelAnimationFrame(requestId))
    task.on('run', () => _requestAnimationFrame())
    return task.run()
  }

}


if (!window.URL) {
  window.URL = window.URL || window.webkitURL || window.msURL || window.oURL
}

if (!navigator.getUserMedia) {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
}
