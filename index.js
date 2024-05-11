const {
   spawn
} = require('child_process')
const path = require('path')
const express = require('express')
const server = express()
const fetch = require('node-fetch')
const PORT = process.env.PORT || 3000

server.set('json spaces', 2)
server.get('*', async (req, res) => {
   res.json({
  online: true,
  msg: `Server running with port ${PORT}`,
  server: await (await fetch('http://ip-api.com/json')).json()
   })
})

server.listen(PORT, () => {
   console.log(`Server running with port ${PORT}!`)
})

function start() {
   let args = [path.join(__dirname, 'server.js'), ...process.argv.slice(2)]
   console.log([process.argv[0], ...args].join('\n'))
   let p = spawn(process.argv[0], args, {
         stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      })
      .on('message', data => {
         if (data == 'reset') {
            console.log('Restarting Bot...')
            p.kill()
            start()
            delete p
         }
      })
      .on('exit', code => {
         console.error('Exited with code:', code)
         if (code == '.' || code == 1 || code == 0) start()
      })
}
start()
