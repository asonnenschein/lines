import EventEmitter from "./EventEmitter"


export default class extends EventEmitter {

  constructor(tracker) {
    super()
    if (!tracker) {
      throw new Error('Tracker instance not specified.')
    }
    this._tracker = null
    this._running = false
    this.setTracker(tracker)
  }

  getTracker() {
    return this._tracker
  }

  isRunning() {
    return this._running
  }

  setRunning(running) {
    this._running = running
  }

  setTracker(tracker) {
    this._tracker = tracker
  }

  run() {
    if (this.isRunning()) {
      return
    }

    this.setRunning(true)
    this._reemitTrackEvent = function(event) {
      this.emit('track', event)
    }
    this._tracker.on('track', this._reemitTrackEvent)
    this.emit('run')
    return this
  }

  stop() {
    if (!this.isRunning()) {
      return
    }

    this.setRunning(false)
    this.emit('stop')
    this._tracker.removeListener('track', this._reemitTrackEvent)
    return this
  }

}
