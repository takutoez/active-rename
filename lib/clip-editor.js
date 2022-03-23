'use babel'

// buttons as overlay decoration overflows atom-text-editor if it's not clipped.

module.exports = function clipEditor(element) {
  element.style.clip = `rect(0, ${element.clientWidth}px, ${element.clientHeight}px, 0)`
}
