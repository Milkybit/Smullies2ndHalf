// localStorage-shim zodat de storage-laag ongewijzigd onder node:test draait.
class GeheugenStorage {
  constructor() { this.data = new Map() }
  getItem(k) { return this.data.has(k) ? this.data.get(k) : null }
  setItem(k, v) { this.data.set(k, String(v)) }
  removeItem(k) { this.data.delete(k) }
  clear() { this.data.clear() }
}

export function versStorage() {
  globalThis.localStorage = new GeheugenStorage()
}
