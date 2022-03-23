'use babel'

export default function judgeRename({ renameButtonMain = () => {}, renameAllButtonMain = () => {}, changed, records }) {
  let lastChangedLength = changed.slice(-1)[0].values.length
  let candidates = changed.filter(x => x.values.length === lastChangedLength)

  let name = ''

  for (let i=candidates.length-1; i > 0; i--) {
    let m = candidates[i].identifiers
    let n = candidates[i-1].identifiers

    for (let j=0; j < m.length; j++) {
      if (n[j] === m[j]) continue
      let rename = changed.slice(-1)[0].identifiers[j]
      Object.keys(records).forEach(key => {
        let mm = records[key].slice(-1)[0]

        let results = []
        mm.values.forEach(nn => {
          if (nn === n[j]) {
            results.push(rename)
          } else {
            results.push(nn)
          }
        })
        let result = results.join('')

        if (mm.values.join('') !== result) {
          name = n[j]
          renameButtonMain(key, result, rename)
        }
      })
    }
  }
  if (name) renameAllButtonMain(name)
}
