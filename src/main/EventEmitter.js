export default class {

  constructor() {
    this._events = null
    this.on = this.addListener
  }

  addEventListener(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function.')
    }
    if (!this._events) {
      this.events = {}
    }

    this.emit('newListener', event, listener)

    if (!this._events[event]) {
      this._events[event] = []
    }

    this._events[event] = []

    return this
  }

  listeners(event) {
    return this._events && this._events[event]
  }

  emit(event) {
    const listeners = this.listeners(event)
    if (listeners) {
      const args = Array.prototype.slice.call(arguments, 1)
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i]) {
          listeners[i].apply(this, args)
        }
      }
      return true
    }
    return false
  }

  once(event, listener) {
    this.on(event, function handlerInternal() {
      this.removeListener(event, handlerInternal)
      listener.apply(this, arguments)
    })
  }

  removeAllListeners(opt_event) {
    if (!this._events) {
      return this
    }
    if (opt_event) {
      delete this._events[opt_event]
    }
    else {
      delete this._events
    }
    return this
  }

  removeListener(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function.')
    }
    if (!this._events) {
      return this
    }

    const listeners = this.listeners(event)
    if (Array.isArray(listeners)) {
      const i = listeners.indexOf(listener)
      if (i < 0) {
        return this
      }
      listeners.splice(i, 1)
    }
    return this
  }

  setMaxListeners() {
    throw new Error('Not implemented.')
  }

}
