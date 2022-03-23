# Active rename – Atom package

[![Version](https://user-images.githubusercontent.com/7994764/159639785-979ceda6-514c-405e-8bbd-c67de1bde2b9.svg)](https://atom.io/packages/active-rename)

:atom: Suggests you rename identifiers on each line and all, when you edited a line.

![GIF Animation](https://user-images.githubusercontent.com/7994764/159637058-d0c6b23e-4987-4913-b143-ee9f3748ef85.gif)

## Lexical analysis
Active-rename uses lexical analyzer on node.js (forked from [lex-bnf](https://github.com/takamin/lex-bnf))

Supports
- identifiers (a-z A-Z 0-9 _ $)
- exclude symbols
- exclude string literals ("" '' ``)
- template literals (Javascript)
- formatted string literals (Python)
- string interpolation (C#)
