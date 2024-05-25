# tree-sitter-gap

[![Build/test](https://github.com/gap-system/tree-sitter-gap/actions/workflows/ci.yml/badge.svg)](https://github.com/gap-system/tree-sitter-gap/actions/workflows/ci.yml)

[tree-sitter](https://github.com/tree-sitter/tree-sitter) grammar for [GAP system](https://www.gap-system.org/) files.

## Example

![Example of a parse tree generated with `tree-sitter-gap`](image-example-parse.svg)

The above is a parse tree generated using the `tree-sitter-gap` grammar for the following code snippet:

```gap
G := Group((1, 2, 3), (1, 2)(3, 4));
IsNormal(SymmetricGroup(4), G);
```

## Want to help improve this?

- Install `tree-sitter` (version >= 0.22.2), [official instructions](https://tree-sitter.github.io/tree-sitter/creating-parsers#installation);
- Read ["how to create a parser"](https://tree-sitter.github.io/tree-sitter/creating-parsers);
- Resolve the TODOs in source and test files;
- Add more missing language features;
- Validate by running on the whole `GAP` library and on packages, see [Tests](#tests) section below.

Files to edit are

- `grammar.js`, the main file defining the grammar, [documentation](https://tree-sitter.github.io/tree-sitter/creating-parsers#the-grammar-dsl);
- `src/scanner.c`, an external scanner used for scanning tokens that are not
  easily recognized by the built in rules, [documentation](https://tree-sitter.github.io/tree-sitter/creating-parsers#external-scanners);
- `tests/corpus/*.txt`, test files containing annotated syntax trees used to
  validate the grammar, ideally a test case should be added here prior to
  changing the `grammar.js` or `scanner.c` files, [documentation](https://tree-sitter.github.io/tree-sitter/creating-parsers#command-test);
- `queries/*.scm`, queries used for syntax highlighting etc, [documentation](https://tree-sitter.github.io/tree-sitter/syntax-highlighting#queries);
- `tests/highlight/*`, tests for syntax highlighting, [documentation](https://tree-sitter.github.io/tree-sitter/syntax-highlighting#unit-testing);
- `examples/*`, assortment of various example `gap` files, also used to store `GAP` library and package corpus for tests, see [Tests](#tests) below.

Almost everything else was generated automatically by `tree-sitter generate`.

Bits of the `GAP` syntax are documented in [Chapter 4](https://docs.gap-system.org/doc/ref/chap4_mj.html) of the GAP manual.
A more in-depth look at the `GAP` grammar can be obtained by studying the `GAP-system` source files, especially

- [`read.c`](https://github.com/gap-system/gap/blob/master/src/read.c) for parsing keywords and high level language constructs;
- [`scanner.c`](https://github.com/gap-system/gap/blob/master/src/scanner.c) for matters relating to scanning literals and identifiers;
- [`io.c`](https://github.com/gap-system/gap/blob/master/src/io.c) for handling whitespace and line continuation characters.

## Tests

To run syntax tree and highlighting tests run

```
make test_quick
```

note that highlighting tests will only be run once all syntax tree tests pass.

To run tests against the `GAP` library and `GAP` package corpus do

```
make corpus && make test_all
```

the first command will checkout a copy of
[`GAP`](https://github.com/gap-system/gap) and download a package archive, then
recursively copy `GAP` files into the appropriate `examples/` subdirectory. The
second command will then parse each of these files using the `tree-sitter`
grammar. The output of `make test_all` is a list of `GAP` files that the
grammar fails to parse, along with some statistics on failing and succeeding
parses.

## Troubleshooting

### Issues finding grammar in external tools

Try specifying the grammar name as lowercase `gap`, instead of uppercase `GAP`.

### Highlighting tests fail

Make sure you are using `tree-sitter` 0.22.2 or above. A breaking change in
highlight group priority was introduces with version 0.22.2, which means that
older versions of the `tree-sitter` tool will incorrectly highlight the
existing test files.

## Acknowledgements

Writing this `tree-sitter` grammar and associated query files was made significantly easier by studying the
existing parsers, especially [`tree-sitter-python`](https://github.com/tree-sitter/tree-sitter-python),
[`tree-sitter-ruby`](https://github.com/tree-sitter/tree-sitter-ruby)
and [`tree-sitter-c`](https://github.com/tree-sitter/tree-sitter-c), from which
certain code snippets have been taken verbatim. We would like to thank the authors and maintainers
of these packages.
