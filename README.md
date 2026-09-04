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

The grammar targets the Marimay 0.1 design surface shipped by the
`0.1.0-alpha.1` toolchain, including declarations, generic types and calls,
records, algebraic enums, interfaces, pattern matching, postfix `?`, closures,
direct-style `scope`/`spawn`, interpolated strings, Unicode XID identifiers,
hard keywords, and nested block comments.

Set `MMAY` to an `0.1.0-alpha.1` compiler when running the suite to also check
that every valid fixture is accepted by the canonical formatter:

```sh
MMAY=/absolute/path/to/mmay npm test
```
