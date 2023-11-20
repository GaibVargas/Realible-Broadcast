import { BestEffortBroadcast, Message, Host } from '../lib/index'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const group: Host[] = [
  {
    port: 3000,
    address: 'localhost'
  },
  {
    port: 3001,
    address: 'localhost'
  },
]

const port = parseInt(process.argv[2])
const beb = new BestEffortBroadcast(port, group)

function main() {
  console.log('Para sair digite: !q')
  rl.prompt(true)

  rl.on('line', (input) => {
    if (input === '!q') {
      rl.close()
      return
    }
    beb.broadcast(new Message(input, { port, address: 'localhost' } as Host))
    rl.prompt(true)
  })

  rl.on('close', () => {
    beb.close()
  })

  beb.onReceiveMessage((msg: Message) => {
    if (msg.sender.port !== port) {
      console.log(`[${msg.sender.port}]`, msg.data)
    }
    rl.prompt(true)
  })
}

main()
