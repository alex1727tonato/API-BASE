import { resolve } from 'path'
import { readFileSync } from 'fs'

export function getJSONFromEnum(path: string) {
  return JSON.parse(
    readFileSync(resolve(__dirname, `../assets/enums/${path}`), 'utf-8'),
  )
}

export interface EnumerateData<T = string> {
  id: T
  description: string
  value?: number
  stringValue?: string
  show?: boolean
}

class Enumerate<T = string> {
  readonly data: EnumerateData<T | string>[]

  constructor(data: EnumerateData<T>[]) {
    this.data = data
  }

  getEnum() {
    return this.data.map((x) => x.id)
  }

  getData() {
    return this.data.filter((x) => x.show !== false)
  }

  find(id: T | string) {
    return this.data.find((el) => el.id === id)
  }

  get(id: T) {
    let found = this.data.find((el) => el.id === id)
    if (!found) {
      found = { id: '000', description: 'No encontrado' }
    }
    return found
  }
}

export default Enumerate
