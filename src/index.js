import express from './express/index.js'
import { description, version } from '../package.json'
import config from './common/config/index'

const app = require('http').createServer(express)

app.listen(8081, (err) => {
  if (err) {
    console.log(err)
    process.exit()
  }
  console.log(`${description} version ${version} Ready on port ${8081}`)
})
export default app
