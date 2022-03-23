'use babel'

import { Disposable, CompositeDisposable, Range } from 'atom'
import escapeStringRegexp from 'escape-string-regexp'

import clipEditor from './clip-editor'
import Record from './record'
import generateUUID from './uuid'

import LineButton from './line-button'

import judgeRename from './judge-rename'

export default {

  activate(state) {

    this.states = { buttonClicked: false, renameButtonCount: 0 }

    this.objects = {}

    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.workspace.observeTextEditors(editor => {
      if (!editor) return
      if (this.objects[editor.id]) return
      if (editor.getLineCount() >= atom.config.get('active-rename.maximumNumberOfLines')) return

      this.objects[editor.id] = { tables: [], records: {}, buttons: [] }
      let o = this.objects[editor.id]

      const pushRecord = (uuid, text) => {
        let record = new Record(text)
        if (o.records[uuid]) {
          o.records[uuid].push(record)
        } else {
          o.records[uuid] = [record]
        }
      }

      let worker = new Worker(__dirname + '/worker.js')

      worker.addEventListener('message', event => {
        o.tables = event.data.tables
        let r = event.data.records
        Object.keys(r).forEach(key => {
          let record = new Record()
          record.tokens = r[key]
          o.records[key] = [record]
        })
      }, false)

      worker.postMessage(editor.getText())

      const createLineButton = (uuid) => {
        let row = o.tables.indexOf(uuid)
        let text = editor.lineTextForBufferRow(row)

        let button = o.buttons[uuid]
        if (!button) {
          button = new LineButton()
        } else {
          button.marker.destroy()
        }
        let marker = editor.markBufferRange(new Range([row, 0], [row, text.length+1]), { invalidate: 'never' })
        editor.decorateMarker(marker, { type: 'overlay', class: 'active-rename', item: button, avoidOverflow: false })
        button.marker = marker
        button.uuid = uuid
        o.buttons[uuid] = button
        return button
      }

      editor.onDidStopChanging(callback => {
        callback.changes.forEach(change => {

          // Update tables for new lines.
          let newRows = change.newRange.getRows().filter((x, i, self) => change.oldRange.getRows().indexOf(x) === -1)
          let oldRows = change.oldRange.getRows().filter((x, i, self) => change.newRange.getRows().indexOf(x) === -1)

          newRows.forEach(row => {
            let uuid = generateUUID()
            let text = editor.lineTextForBufferRow(row)
            o.tables.splice(row, 0, uuid)
          })

          oldRows.forEach(row => {
            deleteButton(o.tables[row])
            delete o.records[o.tables[row]]
          })

          oldRows.forEach(row => {
            o.tables.splice(row, 1)
          })

          change.newRange.getRows().forEach(row => {
            let text = editor.lineTextForBufferRow(row)
            let uuid = o.tables[row]

            if (!text || !text.match(/\S/g)) {
              delete o.records[uuid]
              return
            }

            pushRecord(uuid, text)

            if (this.states.buttonClicked) {
              return
            } else {
              Object.keys(o.buttons).forEach(key => { deleteButton(key) })
            }

            let self = this

            judgeRename({ renameButtonMain: (key, result, rename) => {
              createLineButton(key).renameButton({ main: () => {
                self.states.buttonClicked = true
                let _row = o.tables.indexOf(key)
                let _text = editor.lineTextForBufferRow(_row)
                editor.undo()
                editor.transact(() => { // Batch multiple operations as a single undo/redo step.
                  editor.redo()
                  editor.setTextInBufferRange(new Range([_row, 0], [_row, _text.length+1]), result)
                })
                // hide Autocomplete.
                editor.getLastCursor().moveLeft()
                editor.getLastCursor().moveRight()

                if (getRenameButtonKeys().length == 0) {
                  Object.keys(o.buttons).forEach(key => { deleteButton(key) })
                }
              }, rename: rename })
            }, renameAllButtonMain: (name) => {
              createLineButton(uuid).renameAllButton({ main: () => {
                editor.undo()
                editor.transact(() => { // Batch multiple operations as a single undo/redo step.
                  editor.redo()
                  getRenameButtonKeys().forEach(key => {
                    o.buttons[key].renameElement.onclick()
                  })
                  // hide Autocomplete.
                  editor.getLastCursor().moveLeft()
                  editor.getLastCursor().moveRight()
                })
              }, name: name, number: getRenameButtonKeys().length })
            }, changed: o.records[uuid], records: o.records })
          })
        })

        if (this.states.buttonClicked) this.states.buttonClicked = false
      })

      function getRenameButtonKeys() {
        return Object.keys(o.buttons).filter(key => o.buttons[key].rename)
      }

      function deleteButton(key) {
        if (!o.buttons[key]) return
        o.buttons[key].destroy()
        delete o.buttons[key]
      }
    }))

    let activeTextEditor
    atom.workspace.observeActiveTextEditor(editor => {
      activeTextEditor = editor
    })
    window.addEventListener('mouseover', () => {
      if (activeTextEditor) clipEditor(activeTextEditor.getElement())
    })
  },

  deactivate() {
    this.subscriptions.dispose()
  },

  config: {
    maximumNumberOfLines: {
      title: 'Limit maximum number of lines',
      description: 'Smaller number prevents Atom from being laggy.',
      type: 'number',
      minimum: 0,
      default: 1000,
    },
    renameButtonColor: {
      title: '➤ Rename button color',
      type: 'color',
      default: '#72C6EF',
    },
  },

}
