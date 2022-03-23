'use babel'

const lex = require('./lex.js')

class Record {
  constructor(text) {
    this.tokens = lex(text)
  }

  get values() {
    return this.tokens.map(token => token[1])
  }

  get identifiers() {
    return this.tokens.filter(token => token[0] === 'ide').map(token => token[1])
  }
}
module.exports = Record
