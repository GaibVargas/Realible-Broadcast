import { Broadcast, Message, Host } from '../lib/index'
import * as readline from 'readline'
import { getIp } from '../utils'

function main(port: number) {
  const group: Host[] = [
    {
      port: 3000,
      address: getIp()
    },
    {
      port: 3001,
      address: getIp()
    },
    {
      port: 3002,
      address: getIp()
    },
    {
      port: 3003,
      address: getIp()
    },
  ]

  const beb = new Broadcast(port, group)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.on('line', (input) => {
    beb.broadcast(input)
    rl.prompt(true)
  })

  rl.on('close', () => {
    beb.close()
  })

  beb.onReceiveMessage((msg: Message) => {
    console.log(`[${msg.sender.address}:${msg.sender.port}]`, msg.data)
    rl.prompt(true)
  })

  console.log('Para sair digite: Ctrl + c')
  rl.prompt(true)
}

main(parseInt(process.argv[2]))
