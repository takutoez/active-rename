'use babel'

import { Range } from 'atom'
import Record from './record'

export default class LineButton {

  constructor() {
    this.element = document.createElement('div')

    this.renameElement = document.createElement('div')
    this.renameElement.className = 'rename-button'
    this.renameAllElement = document.createElement('div')
    this.renameAllElement.className = 'rename-all-button'

    this.element.appendChild(this.renameElement)
    this.element.appendChild(this.renameAllElement)

    atom.config.observe('active-rename', values => {
      this.renameElement.style.color = values.renameButtonColor.toHexString()
      this.renameAllElement.style.color = values.renameButtonColor.toHexString()
    })

    atom.config.observe('editor.lineHeight', value => {
      this.element.style.fontSize = value + 'em'
    })
  }

  renameButton({ main = () => {}, rename }) {
    this.rename = true
    this.renameElement.textContent = '➤'

    this.renameElement.onclick = () => {
      this.renameElement.textContent = ''
      this.rename = false
      main()
    }

    if (this.renameTooltip) this.renameTooltip.dispose()
    this.renameTooltip = atom.tooltips.add(this.renameElement, { title: rename, class: 'active-rename', placement: 'auto right', delay: { show: 100, hide: 100 } })
  }

  renameAllButton({ main = () => {}, name, number }) {
    this.renameAll = true
    this.renameAllElement.textContent = [...Array(number)].map(x => '➤').join('')

    this.renameAllElement.onclick = () => {
      this.renameAllElement.textContent = ''
      this.renameAll = false
      main()
    }

    if (this.renameAllTooltip) this.renameAllTooltip.dispose()
    this.renameAllTooltip = atom.tooltips.add(this.renameAllElement, { title: name, class: 'active-rename', placement: 'auto left', delay: { show: 100, hide: 100 } })
  }

  destroy() {
    if (this.renameTooltip) this.renameTooltip.dispose()
    if (this.renameAllTooltip) this.renameAllTooltip.dispose()
    this.marker.destroy()
  }

  set rename(rename) {
    this._rename = rename
    if (!this.rename && !this.renameAll) {
      this.destroy()
      this.element.remove()
    }
  }

  get rename() {
    return this._rename
  }

  set renameAll(renameAll) {
    this._renameAll = renameAll
    if (!this.rename && !this.renameAll) {
      this.destroy()
      this.element.remove()
    }
  }

  get renameAll() {
    return this._renameAll
  }

  set marker(marker) {
    this._marker = marker
  }

  get marker() {
    return this._marker
  }

  set uuid(uuid) {
    this._uuid = uuid
  }

  get uuid() {
    return this._uuid
  }

}
