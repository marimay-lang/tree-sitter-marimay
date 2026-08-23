# tree-sitter-marimay

Tree-sitter grammar for the Marimay programming language.

The Marimay specification and bootstrap compiler remain authoritative. This
grammar is an editor-oriented projection and intentionally provides useful
recovery for incomplete source while typing.

## Development

```sh
npm install
npm test
```

`npm test` regenerates the parser, runs Tree-sitter corpus tests, and rejects
parse errors in the representative Marimay fixtures.

The grammar currently targets the Marimay 0.1 surface, including declarations,
generic types and calls, records, algebraic enums, interfaces, pattern
matching, postfix `?`, closures, direct-style `scope`/`spawn`, interpolated
strings, contextual keywords, and nested block comments.
