# tree-sitter-marimay

![Tree-sitter for Marimay — a Marimay learning project](.github/banner.svg)

> **Personal learning project.** This open-source MIT project is part of
> [Marimay](https://github.com/marimay-lang/marimay), my hobby programming-language project.
> I maintain it in my spare time to learn by building. APIs and tooling may
> change, and progress may be intermittent.

A Tree-sitter grammar for Marimay declarations, generics, nominal records and
enums, interfaces, pattern matching, postfix `?`, closures, direct-style
`scope`/`spawn`, interpolated strings, Unicode identifiers and nested block comments.

**Status:** Experimental editor grammar. Version `0.1.1` targets the `0.1-design` surface
of Marimay `0.1.0-alpha.1`. The specification and compiler remain authoritative;
the editor grammar supports recovery while typing incomplete source.

## Run and verify

```sh
npm ci
npm test
# Also check valid fixtures with the canonical formatter:
MMAY=/absolute/path/to/mmay npm test
```

Install Node.js/npm and a C toolchain. The lockfile pins Tree-sitter CLI
`0.26.12`. The suite regenerates/builds the parser, runs corpus and query checks,
accepts valid fixtures and rejects invalid ones. Use a compatible compiler for
the optional `MMAY` formatter checks. Current scripts name a `.dylib` artifact;
other platforms need their own validation.

[`marimay-zed`](https://github.com/marimay-lang/marimay-zed) is the companion Zed extension.

## License

[MIT](LICENSE). Existing copyright attribution is retained.
