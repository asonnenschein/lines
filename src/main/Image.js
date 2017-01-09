export default class {

  blur(pixels, width, height, diameter) {
    diameter = Math.abs(diameter)
    if (diameter <= 1) {
      throw new Error('Diameter should be greater than 1.')
    }
    const radius = diameter / 2
    const len = Math.ceil(diameter) + (1 - (Math.ceil(diameter) % 2))
    const weights = new Float32Array(len)
    const rho = (radius + 0.5) / 3
    const rhoSq = rho * rho
    const gaussianFactor = 1 / Math.sqrt(2 * Math.PI * rhoSq)
    const rhoFactor = -1 / (2 * rho * rho)
    let wsum = 0
    const middle = Math.floor(len / 2)

    for (let i = 0; i < len; i++) {
      const x = i - middle
      const gx = gaussianFactor * Math.exp(x * x * rhoFactor)
      weights[i] = gx
      wsum += gx
    }

    for (let j = 0; j < weights.length; j++) {
      weights[j] /= wsum
    }

    return this.separableConvolve(pixels, width, height, weights, weights, false)
  }

  computeIntegralImage(pixels, width, height, opt_integralImage, opt_integralImageSquare, opt_tiltedIntegralImage, opt_integralImageSobel) {
    if (arguments.length < 4) {
      throw new Error('You should specify at least one output array in the order: sum, square, tilted, sobel.')
    }

    if (opt_integralImageSobel) {
      const pixelsSobel = this.sobel(pixels, width, height)
    }

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const w = i * width * 4 + j * 4
        const pixel = ~~(pixels[w] * 0.299 + pixels[w + 1] * 0.587 + pixels[w + 2] * 0.114)
        if (opt_integralImage) {
          this._computePixelValueSAT(opt_integralImage, width, i, j, pixel)
        }
        if (opt_integralImageSquare) {
          this._computePixelValueSAT(opt_integralImageSquare, width, i, j, pixel * pixel)
        }
        if (opt_tiltedIntegralImage) {
          const w1 = w - width * 4
          const pixelAbove = ~~(pixels[w1] * 0.299 + pixels[w1 + 1] * 0.587 + pixels[w1 + 2] * 0.114)
          this._computePixelValueRSAT(opt_tiltedIntegralImage, width, i, j, pixel, pixelAbove || 0)
        }
        if (opt_integralImageSobel) {
          this._computePixelValueSAT(opt_integralImageSobel, width, i, j, pixelsSobel[w])
        }
      }
    }
  }

  _computePixelValueRSAT(RSAT, width, i, j, pixel, pixelAbove) {
    const w = i * width + j
    RSAT[w] = (RSAT[w - width - 1] || 0) + (RSAT[w - width + 1] || 0) - (RSAT[w - width - width] || 0) + pixel + pixelAbove
  }

  _computePixelValueSAT(SAT, width, i, j, pixel) {
    const w = i * width + j
    SAT[w] = (SAT[w - width] || 0) + (SAT[w - 1] || 0) + pixel - (SAT[w - width - 1] || 0)
  }

  grayscale(pixels, width, height, fillRGBA) {
    const gray = new Uint8ClampedArray(fillRGBA ? pixels.length : pixels.length >> 2)
    let p = 0
    let w = 0
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const value = pixels[w] * 0.299 + pixels[w + 1] * 0.587 + pixels[w + 2] * 0.114
        gray[p++] = value

        if (fillRGBA) {
          gray[p++] = value
          gray[p++] = value
          gray[p++] = pixels[w + 3]
        }

        w += 4
      }
    }
    return gray
  }

  horizontalConvolve(pixels, width, height, weightsVector, opaque) {
    const side = weightsVector.length
    const halfSide = Math.floor(side / 2)
    const output = new Float32Array(width * height * 4)
    const alphaFac = opaque ? 1 : 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sy = y
        const sx = x
        const offset = (y * width + x) * 4
        let r = 0
        let g = 0
        let b = 0
        let a = 0
        for (let cx = 0; cx < side; cx++) {
          const scy = sy
          const scx = Math.min(width - 1, Math.max(0, sx + cx - halfSide))
          const poffset = (scy * width + scx) * 4
          const wt = weightsVector[cx]
          r += pixels[poffset] * wt
          g += pixels[poffset + 1] * wt
          b += pixels[poffset + 2] * wt
          a += pixels[poffset + 3] * wt
        }
        output[offset] = r
        output[offset + 1] = g
        output[offset + 2] = b
        output[offset + 3] = a + alphaFac * (255 - a)
      }
    }
    return output
  }

  verticalConvolve(pixels, width, height, weightsVector, opaque) {
    const side = weightsVector.length
    const halfSide = Math.floor(side / 2)
    const output = new Float32Array(width * height * 4)
    const alphaFac = opaque ? 1 : 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sy = y
        const sx = x
        const offset = (y * width + x) * 4
        let r = 0
        let g = 0
        let b = 0
        let a = 0
        for (let cy = 0; cy < side; cy++) {
          const scy = Math.min(height - 1, Math.max(0, sy + cy - halfSide))
          const scx = sx
          const poffset = (scy * width + scx) * 4
          const wt = weightsVector[cy]
          r += pixels[poffset] * wt
          g += pixels[poffset + 1] * wt
          b += pixels[poffset + 2] * wt
          a += pixels[poffset + 3] * wt
        }
        output[offset] = r
        output[offset + 1] = g
        output[offset + 2] = b
        output[offset + 3] = a + alphaFac * (255 - a)
      }
    }
    return output
  }

  separableConvolve(pixels, width, height, horizWeights, vertWeights, opaque) {
    const vertical = this.verticalConvolve(pixels, width, height, vertWeights, opaque)
    return this.horizontalConvolve(vertical, width, height, horizWeights, opaque)
  }

  sobel(pixels, width, height) {
    pixels = this.grayscale(pixels, width, height, true)
    const output = new Float32Array(width * height * 4)
    const sobelSignVector = new Float32Array([-1, 0, 1])
    const sobelScaleVector = new Float32Array([1, 2, 1])
    const vertical = this.separableConvolve(pixels, width, height, sobelSignVector, sobelScaleVector)
    const horizontal = this.separableConvolve(pixels, width, height, sobelScaleVector, sobelSignVector)

    for (let i = 0; i < output.length; i += 4) {
      const v = vertical[i]
      const h = horizontal[i]
      const p = Math.sqrt(h * h + v * v)
      output[i] = p
      output[i + 1] = p
      output[i + 2] = p
      output[i + 3] = 255
    }

    return output
  }

}
