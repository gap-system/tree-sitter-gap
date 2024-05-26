#include "tree_sitter/parser.h"
#include <wctype.h>

enum TokenType {
  STRING_START,
  STRING_CONTENT,
  STRING_END,
};

typedef struct {
  bool is_triple;
} Scanner;

static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }
static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

bool tree_sitter_GAP_external_scanner_scan(void *payload, TSLexer *lexer,
                                           const bool *valid_symbols) {
  Scanner *scanner = (Scanner *)payload;

  if (valid_symbols[STRING_START]) {
    while (iswspace(lexer->lookahead))
      skip(lexer);
    if (lexer->lookahead == '"') {
      advance(lexer);
      lexer->mark_end(lexer);
      scanner->is_triple = false;
      if (lexer->lookahead == '"') {
        advance(lexer);
        if (lexer->lookahead == '"') {
          advance(lexer);
          lexer->mark_end(lexer);
          scanner->is_triple = true;
        }
      }
      lexer->result_symbol = STRING_START;
      return true;
    }
    return false;
  }

  if (valid_symbols[STRING_CONTENT]) {
    bool has_content = false;
    while (lexer->lookahead) {
      if (lexer->lookahead == '"') {
        if (!scanner->is_triple && has_content) {
          lexer->result_symbol = STRING_CONTENT;
          return true;
        }
        advance(lexer);
        if (!scanner->is_triple) {
          if (valid_symbols[STRING_END]) {
            lexer->result_symbol = STRING_END;
            return true;
          }
          return false;
        }
        if (lexer->lookahead == '"') {
          advance(lexer);
          if (lexer->lookahead == '"') {
            if (has_content) {
              lexer->result_symbol = STRING_CONTENT;
              return true;
            }
            advance(lexer);
            if (valid_symbols[STRING_END]) {
              lexer->result_symbol = STRING_END;
              return true;
            }
            return false;
          }
        }
        has_content = true;
      } else if (lexer->lookahead == '\\') {
        if (scanner->is_triple) {
          lexer->mark_end(lexer);
          advance(lexer);
          if (lexer->lookahead == '\r' || lexer->lookahead == '\n') {
            lexer->result_symbol = STRING_CONTENT;
            return has_content;
          }
          lexer->mark_end(lexer);
          has_content = true;
        } else {
          lexer->result_symbol = STRING_CONTENT;
          return has_content;
        }
      } else if (!scanner->is_triple &&
                 (lexer->lookahead == '\r' || lexer->lookahead == '\n')) {
        return false;
      } else {
        advance(lexer);
        has_content = true;
      }
      lexer->mark_end(lexer);
    }
  }

  if (valid_symbols[STRING_END]) {
    if (lexer->lookahead == '"') {
      advance(lexer);
      if (!scanner->is_triple) {
        lexer->mark_end(lexer);
        lexer->result_symbol = STRING_END;
        return true;
      }
      if (lexer->lookahead == '"') {
        advance(lexer);
        if (lexer->lookahead == '"') {
          advance(lexer);
          lexer->mark_end(lexer);
          lexer->result_symbol = STRING_END;
          return true;
        }
      }
    }
    return false;
  }

  return false;
}

unsigned tree_sitter_GAP_external_scanner_serialize(void *payload,
                                                    char *buffer) {
  Scanner *scanner = (Scanner *)payload;

  size_t size = 0;
  buffer[size++] = (char)scanner->is_triple;
  return size;
}

void tree_sitter_GAP_external_scanner_deserialize(void *payload,
                                                  const char *buffer,
                                                  unsigned length) {
  Scanner *scanner = (Scanner *)payload;
  if (length > 0) {
    size_t size = 0;
    scanner->is_triple = (bool)buffer[size++];
  }
}

void *tree_sitter_GAP_external_scanner_create() {
  Scanner *scanner = calloc(1, sizeof(Scanner));
  return scanner;
}

void tree_sitter_GAP_external_scanner_destroy(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  free(scanner);
}
