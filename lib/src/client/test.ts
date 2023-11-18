import { BestEffortBroadcast, Message, Host } from '../lib/index'
import * as readline from 'readline'

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
beb.onReceiveMessage((msg: Message) => { console.log('Recebeu msg', msg.data) })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  })
}

async function main() {
  while (true) {
    const msg = await askQuestion('Message: ')
    if (msg == 'q') {
      rl.close()
      break
    }
    beb.broadcast(new Message(msg, { port, address: 'localhost' } as Host))
  }
}

main()
