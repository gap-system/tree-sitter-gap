{
  "targets": [
    {
      "target_name": "tree_sitter_YOUR_LANGUAGE_NAME_binding",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "src"
      ],
      "sources": [
        "src/parser.c",
        "src/scanner.c",
        "bindings/node/binding.cc"
      ],
      "cflags_c": [
        "-std=c99",
      ]
    }
  ]
}
