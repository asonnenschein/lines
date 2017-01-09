import Tracker from "./Tracker"
import ViolaJones from "./ViolaJones"

let violaJones = new ViolaJones()

export default class extends Tracker {

  constructor(opt_classifiers) {
    super()
    this.edgesDensity = 0.2
    this.initialScale = 1.0
    this.scaleFactor = 1.25
    this.stepSize = 1.5

    if (opt_classifiers) {
      if (!Array.isArray(opt_classifiers)) {
        opt_classifiers = [opt_classifiers]
      }

      if (Array.isArray(opt_classifiers)) {
        opt_classifiers.forEach(function(classifier, i) {
          if (typeof classifier === 'string') {
            opt_classifiers[i] = violaJones.classifiers[classifier]
          }
          if (!opt_classifiers[i]) {
            throw new Error('Object classifier not valid, try `new tracking.ObjectTracker("face")`.')
          }
        })
      }
    }
    this.setClassifiers(opt_classifiers)
  }

  getClassifiers() {
    return this.classifiers
  }

  getEdgesDensity() {
    return this.edgesDensity
  }

  getInitialScale() {
    return this.initialScale
  }

  getScaleFactor() {
    return this.scaleFactor
  }

  getStepSize() {
    return this.stepSize
  }

  track(pixels, width, height) {
    const self = this
    const classifiers = this.getClassifiers()

    if (!classifiers) {
      throw new Error('Object classifier not specified, try `new tracking.ObjectTracker("face")`.')
    }

    let results = []

    classifiers.forEach(function(classifier) {
      results = results.concat(violaJones.detect(pixels, width, height, self.getInitialScale(), self.getScaleFactor(), self.getStepSize(), self.getEdgesDensity(), classifier))
    })

    this.emit('track', {
      data: results
    })
  }

  setClassifiers(classifiers) {
    this.classifiers = classifiers
  }

  setEdgesDensity(edgesDensity) {
    this.edgesDensity = edgesDensity
  }

  setInitialScale(initialScale) {
    this.initialScale = initialScale
  }

  setScaleFactor(scaleFactor) {
    this.scaleFactor = scaleFactor
  }

  setStepSize(stepSize) {
    this.stepSize = stepSize
  }

}
