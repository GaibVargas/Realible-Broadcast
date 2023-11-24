import { networkInterfaces } from 'os'

export function getIp() {
  const nets = networkInterfaces()
  
  for (const name of Object.keys(nets)) {
    const inetwork = nets[name]
    if (inetwork !== undefined) {
      for (const net of inetwork) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address
        }
      }
    }
  }

  return 'localhost'
}