import { Broadcast, Message, Host } from '../lib/index'
import * as readline from 'readline'
import { getIp } from '../utils'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

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

const port = parseInt(process.argv[2])
const beb = new Broadcast(port, group)

function main() {
  console.log('Para sair digite: !q')
  rl.prompt(true)

  rl.on('line', (input) => {
    if (input === '!q') {
      rl.close()
      return
    }
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
}

main()
