import * as net from 'net'
import { v4 as uuid } from 'uuid'

export type Host = {
  port: number
  address: string
}

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

export class BestEffortBroadcast {
/* Events:
    Request: 〈 beb, Broadcast | m 〉: Broadcasts a message m to all processes.
    Indication: 〈 beb, Deliver | p, m 〉: Delivers a message m broadcast by process p.
    Properties:
        BEB1: Validity: If a correct process broadcasts a message m, then every correct/ process eventually delivers m.
        BEB2: No duplication: No message is delivered more than once.
        BEB3: No creation: If a process delivers a message m with sender s, then m was
        previously broadcast by process s.
*/
  private port: number
  private group: Host[]
  private server: net.Server
  private delivered: Set<string>
  private cb: (msg: Message) => void

  constructor(port: number, group: Host[]) {
    this.port = port
    this.group = group
    this.server = net.createServer(this.onConnect.bind(this))
    this.server.listen(this.port)
    this.delivered = new Set<string>()
    this.cb = () => {}
  }

  private parseMessage(str: string) {
    const msg = JSON.parse(str) as Message
    return new Message(msg.data, msg.sender as Host, msg.id) // BEB3 não violado
  }

  // Lógica de conexão TCP, quando recebe uma mensagem parseia e envia para o receive
  onConnect(connection: net.Socket): void {
    connection.setEncoding('utf8')
    connection.on('data', (data: string) => {
      const msg = this.parseMessage(data) // BEB3 não violado
      this.receive(msg)
    })
  }
  
  // Lógica de conexão TCP, quando envia uma mensagem cria um socket e envia a mensagem em JSON
  send(host: Host, msg: Message) {
    const client = new net.Socket();
    client.setEncoding('utf8')
    client.connect(host.port, host.address, () => {
      client.write(msg.toString())
      client.end()
    })
    client.on('error', () => {})
  }
  
  // Broadcast para todos os hosts do grupo
  broadcast(message: Message) {
    for (const host of this.group) {
      this.send(host, message)
    }
  }

  // Lógica de recebimento de mensagem, se a mensagem já foi entregue, não faz nada, se não, adiciona na lista de entregues e envia para o broadcast
  receive(msg: Message) {
    if (!this.delivered.has(msg.id)) {
      this.delivered.add(msg.id) // BEB2
      this.broadcast(msg) // BEB1
      this.cb(msg) 
    }
  }

  onReceiveMessage(cb: ((msg: Message) => void)): void {
    this.cb = cb
  }

  close() {
    this.server.close()
  }
}
