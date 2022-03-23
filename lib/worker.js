'use babel'

const Language = require('lex-bnf')
const lex = require('./lex.js')
const generateUUID = require('./uuid.js')

self.addEventListener('message',event => {
  let tables = []
  let records = {}
  event.data.split(/\n/).forEach((text, i) => {
    let uuid = generateUUID()
    tables[i] = uuid
    records[uuid] = lex(text)
  })
  self.postMessage({ tables: tables, records: records })
}, false)
