export default class {

  constructor(length) {
    if (length === undefined) {
      throw new Error('DisjointSet length not specified.')
    }
    this._length = length !== undefined ? length : null
    this._parent = length !== undefined ? new Uint32Array(length) : null
    for (let i = 0; i < length; i++) {
      this.parent[i] = i
    }
  }

  find(i) {
    if (this.parent[i] === i) {
      return i
    }
    else {
      return (this.parent[i] = this.find(this.parent[i]))
    }
  }

  union(i, j) {
    const iRepresentative = this.find(i)
    const jRepresentative = this.find(j)
    this.parent[iRepresentative] = jRepresentative
  }

}
