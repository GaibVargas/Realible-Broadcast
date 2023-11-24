import * as net from 'net'
import { getIp } from '../utils'
import { Message } from './message'
import { Host } from './types'

export {
  Message,
  Host
}

export class Broadcast {
  private port: number
  private group: Host[]
  private server: net.Server

  private delivered: Set<string>
  private pending: Set<string>
  private acks: Map<string, number>
  private onDeliverCallback: (msg: Message) => void

  constructor(port: number, group: Host[]) {
    this.port = port
    this.group = group
    this.server = net.createServer(this.onConnect.bind(this))
    this.server.listen(this.port)
    
    this.delivered = new Set<string>
    this.pending = new Set<string>() // Diferente do livro, não armazenamos a mensagem no pending, apenas seu ID.
    this.acks = new Map<string, number>()
    this.onDeliverCallback = () => {}
  }

  private parseMessage(str: string) {
    const msg = JSON.parse(str) as Message
    return new Message(msg.data, msg.sender as Host, msg.id)
  }

  // Lógica de conexão TCP (PL), quando recebe uma mensagem parseia e envia para o bebDeliver
  private onConnect(connection: net.Socket): void {
    connection.setEncoding('utf8')
    connection.on('data', (data: string) => {
      const msg = this.parseMessage(data)
      this.bebDeliver(msg)
    })
  }
  
  // Lógica de conexão TCP, quando envia uma mensagem cria um socket e envia a mensagem em JSON
  private bebSend(host: Host, msg: Message) {
    // Conexão criada a cada mensagem para facilitar demonstração de erros em nós do grupo.
    // Já que o grupo é estático, o simples fato de um nó não estar ligado já é considerado um erro.
    const client = new net.Socket();
    client.setEncoding('utf8')
    client.connect(host.port, host.address, () => {
      client.write(msg.toString())
      client.end()
    })
    client.on('error', () => {}) // Para não mostrar logs de erro no terminal do cliente, ser fail-silent
  }
  
  // Broadcast para todos os hosts do grupo
  private bebBroadcast(message: Message) {
    for (const host of this.group) {
      this.bebSend(host, message)
    }
  }

  private bebDeliver(msg: Message) {
    this.receive(msg)
  }

  broadcast(data: string) {
    const msg = new Message(
      data,
      {
        address: getIp(),
        port: this.port
      } as Host
    )
    this.pending.add(msg.id)
    this.bebBroadcast(msg)
  }

  private incrementAcks(msg: Message) {
    this.acks.set(msg.id, (this.acks.get(msg.id) || 0) + 1)
  }

  private receive(msg: Message) {
    this.incrementAcks(msg)
    if (!this.pending.has(msg.id)) {
      this.pending.add(msg.id)
      this.bebBroadcast(msg)
    }

    if (!this.delivered.has(msg.id) && this.canDeliver(msg)) {
      this.deliver(msg)
    }
  }

  private canDeliver(msg: Message) {
    return (this.acks.get(msg.id) || 0) > (this.group.length / 2)
  }

  private deliver(msg: Message) {
    this.delivered.add(msg.id)
    this.onDeliverCallback(msg)
  }

  onReceiveMessage(cb: ((msg: Message) => void)): void {
    this.onDeliverCallback = cb
  }

  close() {
    this.server.close()
  }
}
