export default class {

  distance(x0, y0, x1, y1) {
    const dx = x1 - x0
    const dy = y1 - y0
    return Math.sqrt(dx * dx + dy * dy)
  }

  hammingWeight(i) {
    i = i - ((i >> 1) & 0x55555555)
    i = (i & 0x33333333) + ((i >> 2) & 0x33333333)
    return ((i + (i >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
  }

  uniformRandom(a, b) {
    return a + Math.random() * (b - a)
  }

  intersectRect(x0, y0, x1, y1, x2, y2, x3, y3) {
    return !(x2 > x1 || x3 < x0 || y2 > y1 || y3 < y0)
  }

}
