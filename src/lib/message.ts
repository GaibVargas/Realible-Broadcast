import { v4 as uuid } from 'uuid'
import { Host } from './types'

export class Message {
  sender: Host
  data: string
  id: string

  constructor(data: string, sender: Host, id?: string) {
    this.data = data
    this.sender = sender
    if (!id) {
      this.id = uuid()
    } else {
      this.id = id
    }
  }

  toString() {
    const str = JSON.stringify({
      id: this.id,
      sender: this.sender,
      data: this.data,
    })
    return str
  }
}