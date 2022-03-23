'use babel'

const Language = require('lex-bnf')
const { syntax, strlit, numlit, whitespace: wsplit, punct: pctlit, literal:l } = Language

const lang = new Language([
  syntax('tokens', [['token*']], t => [].concat(...t.contents())),
  syntax('token', [['templatequojs'], ['templatequopy'], ['templatequoc#'], ['tok']], t => t.contents()[0]),

  syntax('templatequojs', [[l('`'), 'template+', l('`')]], t => [['pct', '`'], ...t.contents()[1], ['pct', '`']]),
  syntax('templatequopy', [[l('f'), l('\"'), 'template+', l('\"')]], t => [['pct', 'f\"'], ...t.contents()[2], ['pct', '\"']]),
  syntax('templatequoc#', [[l('$'), l('\"'), 'template+', l('\"')]], t => [['pct', '$\"'], ...t.contents()[2], ['pct', '\"']]),
  syntax('template+', [['template', 'template*']], t => [].concat(...t.contents())),
  syntax('template', [['bra'], ['templateany']], t => [].concat(...t.contents())),
  syntax('templateany', [['anylit-bracket+']], t => [['templateany', t.str()]]),
  syntax('anylit-bracket+', [['anylit-bracket', 'anylit-bracket*']], t => t.str()),
  syntax('anylit-bracket', [[strlit], [numlit], [wsplit], ['pctlit']], t => t.str()),
  syntax('bra', [[l('{'), 'ideany+', l('}')]], t => [['pct', '{'], ...t.contents()[1], ['pct', '}']]),
  syntax('ideany+', [['ideany', 'ideany*']], t => [].concat(...t.contents())),
  syntax('ideany', [['ide'], ['wsp'], ['num'], ['pct-bra']], t => t.contents()),
  syntax('pct-bra', [['pctlit']], t => ['pct', t.str()]),

  syntax('tok', [['quo'], ['num'], ['ide'], ['pct'], ['wsp']], t => t.contents()),
  syntax('ide', [['strnum+']], t => ['ide', t.str()]),
  syntax('strnum+', [['strnum', 'strnum*']], t => t.str()),
  syntax('strnum', [[strlit], [numlit], [l('_')], [l('$')]], t => t.str()),
  syntax('quo', [[l('\''), 'anylit-squo+', l('\'')], [l('\"'), 'anylit-dquo+', l('\"')], [l('`'), 'anylit-gquo+', l('`')], [l('\''), l('\'')], [l('\"'), l('\"')], [l('`'), l('`')]], t => ['quo', t.str()]),
  syntax('anylit-squo+', [['anylit-squo', 'anylit-squo*']], t => t.str()),
  syntax('anylit-squo', [[l('\"')], [l('`')], [strlit], [numlit], [wsplit], ['bracket'], ['pctlit']], t => t.str()),
  syntax('anylit-dquo+', [['anylit-dquo', 'anylit-dquo*']], t => t.str()),
  syntax('anylit-dquo', [[l('\'')], [l('`')], [strlit], [numlit], [wsplit], ['bracket'], ['pctlit']], t => t.str()),
  syntax('anylit-gquo+', [['anylit-gquo', 'anylit-gquo*']], t => t.str()),
  syntax('anylit-gquo', [[l('\'')], [l('\"')], [strlit], [numlit], [wsplit], ['bracket'], ['pctlit']], t => t.str()),
  syntax('num', [[numlit, l('.'), numlit], [numlit, l('.')], [l('.'), numlit], [numlit]], t => ['num', t.str()]),
  syntax('wsp', [[wsplit]], t => ['wsp', t.str()]),
  syntax('pct', [[l('\"')], [l('\'')], [l('`')], ['pctlit'], ['bracket']], t => ['pct', t.str()]),
  syntax('bracket', [[l('{')], [l('}')]], t => t.str()),
  syntax('pctlit', [[l('\\'), l('\\')], [l('\\'), l('\"')], [l('\\'), l('\'')], [l('!')], [l('#')], [l('$')], [l('%')], [l('&')], [l('(')], [l(')')], [l('-')], [l('=')], [l('^')], [l('~')], [l('\\')], [l('|')], [l('@')], [l('[')], [l(';')], [l('+')], [l(':')], [l('*')], [l(']')], [l(',')], [l('<')], [l('.')], [l('>')], [l('/')], [l('?')], [l('_')]], t => t.str()),
])

const lex = (text) => {
  if (text) {
    let result = lang.parse(text)
    if(!result.error) {
      try {
        return lang.evaluate(result)
      } catch(err) {
        console.error(`Evaluation error: ${err.message}`)
      }
    } else {
      console.error(`Syntax error: stopped at ${JSON.stringify(result.errorToken)}`)
    }
  }
  return []
}

module.exports = lex
