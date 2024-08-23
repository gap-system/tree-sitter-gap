const PREC = {
  // in the following, we mention the names of the corresponding
  // GAP kernel function
  LAMBDA: 0, // ReadFuncExprAbbrevSingle, ReadFuncExprAbbrevMulti => ->
  OR: 1, // ReadExpr => or
  AND: 2, // ReadAnd => and
  COMPARE: 3, // ReadRel => = <> < > <= >= in
  PLUS: 9, // ReadAri => + - (binary)
  MULTI: 10, // ReadTerm => * / mod
  UNARY: 11, // ReadFactor => not + - (unary)
  POWER: 12, // ReadFactor => ^
  CALL: 13,
};

const LITERAL_REGEXP = {
  IDENTIFIER: /([a-zA-Z_@0-9]|\\.)*([a-zA-Z_@]|\\.)[a-zA-Z_@0-9]*/,
  INTEGER: /[0-9]+/,
  ESCAPE_SEQUENCE: /\\([^0-7\r\n]|0x[0-9a-fA-F]{2,2}|[0-7]{3,3})/,
  LINE_CONTINUATION: /\\\r?\n/,
  NON_TRAILING_PERIOD_FLOAT: /[0-9]*\.[0-9]+/,
  // TODO: (reiniscirpons) Perhaps break this up a bit?
  // v Basic float selector           v Exponent                    v Conversion marker  v Eager conversion marker
  //                                                      v Conversion marker
  EXPONENT_OR_CONVERSION_FLOAT:
    /([0-9]+\.[0-9]*|[0-9]*\.[0-9]+)(([edqEDQ][\+-]?[0-9]+[a-zA-Z]?|[a-cf-pr-zA-CF-PR-Z])(_[a-zA-Z]?)?|_[a-zA-Z]?)/,
  // Help topic or book must exclude the help operators and selectors, which
  // leads to the following rather complicated regex
  HELP_TOPIC_OR_BOOK:
    /[^-+&<>0-9:][^\r\n:]*|([-+&]|<<|>>)[^\r\n:]+|[0-9]+[^0-9\r\n:][^\r\n:]/,
};

module.exports = grammar({
  name: "gap",

  externals: ($) => [
    $.string_start,
    $._string_content,
    $.string_end,
    // NOTE: (reiniscirpons) trailing period floats are implemented using an
    // external scanner since we require more than one token of lookahead to
    // disambiguate them from range expressions. Take for example the two
    // expressions `[1..10]` and `[1.,10]`. With only a single character of
    // lookahead, the parser cannot disambiguate which case it is in upon
    // reading the prefix `[1`, as the next token it sees is a `.` in both
    // cases. I also (unsuccessfully) tried solving this by declaring a
    // conflict between list expressions and range expressions. However, since
    // the conflict spans multiple levels, i.e. its a conflict between the
    // partial parses
    // (list_expression (float ...
    // and
    // (range_expression (integer ...
    // the error will occur when parsing the float, which does not trigger
    // conflict resolution for the range/list expressions.
    $._trailing_period_float,
  ],

  extras: ($) => [$.comment, $.pragma, /\s/, $._line_continuation],

  inline: ($) => [$._expression, $._statement, $._block],

  conflicts: ($) => [
    // The parameters of an atomic function do not necessarily have to use the
    // `readonly` and `readwrite` qualifiers. Therefore the two parameter lists
    // have an inherent conflict.
    [$.parameters, $.qualified_parameters],
  ],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) =>
      repeat(
        choice(
          seq($._expression, ";"),
          $._statement,
          seq($.quit_statement, ";"),
          $.help_statement,
        ),
      ),

    // Statements
    _block: ($) => repeat1($._statement),

    _statement: ($) =>
      choice(
        seq($._statement_inner, ";"),
        ";", // empty statement
      ),

    _statement_inner: ($) =>
      choice(
        $.assignment_statement,
        $.if_statement,
        $.while_statement,
        $.repeat_statement,
        $.for_statement,
        $.atomic_statement,
        $.break_statement,
        $.continue_statement,
        $.return_statement,
        $.call, // procedure call
        // TODO: (fingolfin) should we handle `Unbind`, `Info`, `Assert`, `TryNextMethod`
        // statements? For now, we get away with just treating them as
        // procedure calls
        // NOTE: (reiniscirpons) these are already distinguished as builtin
        // functions in ./queries/highlights.scm, we probably dont need to do
        // anything special in the grammar itself.
      ),

    quit_statement: (_) => /quit|QUIT/,

    assignment_statement: ($) =>
      seq(field("left", $._expression), ":=", field("right", $._expression)),

    if_statement: ($) =>
      seq(
        "if",
        field("condition", $._expression),
        "then",
        optional(field("body", $._block)),
        repeat($.elif_clause),
        optional($.else_clause),
        "fi",
      ),

    elif_clause: ($) =>
      seq(
        "elif",
        field("condition", $._expression),
        "then",
        optional(field("body", $._block)),
      ),

    else_clause: ($) => seq("else", optional(field("body", $._block))),

    while_statement: ($) =>
      seq(
        "while",
        field("condition", $._expression),
        "do",
        optional(field("body", $._block)),
        "od",
      ),

    repeat_statement: ($) =>
      seq(
        "repeat",
        optional(field("body", $._block)),
        "until",
        field("condition", $._expression),
      ),

    for_statement: ($) =>
      seq(
        "for",
        field("identifier", $.identifier),
        "in",
        field("values", $._expression),
        "do",
        optional(field("body", $._block)),
        "od",
      ),

    // GAP source file location: src/read.c ReadAtomic
    atomic_statement: ($) =>
      seq(
        "atomic",
        field(
          "qualified_expressions",
          commaSep1(choice($.qualified_expression, $._expression)),
        ),
        "do",
        optional(field("body", $._block)),
        "od",
      ),

    break_statement: (_) => "break",

    continue_statement: (_) => "continue",

    return_statement: ($) => seq("return", optional($._expression)),

    // Expressions

    _expression: ($) =>
      choice(
        $._variable,
        $.binary_expression,
        $.unary_expression,

        $.integer,
        $.float,
        $.bool,
        $.tilde,
        $.char,
        $.string,
        $.function,
        $.lambda,
        $.atomic_function,

        $.list_expression,
        $.range_expression,
        $.record_expression,
        $.permutation_expression,

        $.parenthesized_expression,
      ),

    // GAP source file location: src/read.c ReadQualifiedExpr
    qualified_expression: ($) => seq($.qualifier, $._expression),

    // Variables

    // GAP source file location: src/read.c ReadCallVarAss
    _variable: ($) =>
      prec(
        -1,
        choice(
          $.identifier,
          $.list_selector,
          $.sublist_selector,
          $.positional_selector,
          $.record_selector,
          $.component_selector,
          $.call,
        ),
      ),

    // GAP source file location: src/read.c ReadSelector
    list_selector: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field("variable", $._expression),
          "[",
          field(
            "selector",
            seq($._expression, optional(seq(",", $._expression))),
          ),
          "]",
        ),
      ),

    // GAP source file location: src/read.c ReadSelector
    sublist_selector: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field("variable", $._expression),
          "{",
          field("selector", $._expression),
          "}",
        ),
      ),

    // GAP source file location: src/read.c ReadSelector
    positional_selector: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field("variable", $._expression),
          "![",
          field("selector", $._expression),
          "]",
        ),
      ),

    // GAP source file location: src/read.c ReadSelector
    record_selector: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field(
            "variable",
            // NOTE: (reiniscirpons) We dont use `$._expression` here since it
            // causes a myriad of issues with float parsing. The key problem is
            // that we cannot have a dot following an integer, since that just
            // describes a float!
            choice(
              $._variable,
              $.bool,
              $.tilde,
              $.char,
              $.string,
              $.record_expression,
              $.parenthesized_expression,
            ),
          ),
          ".",
          field(
            "selector",
            choice($.identifier, $.integer, $.parenthesized_expression),
          ),
        ),
      ),

    // GAP source file location: src/read.c ReadSelector
    component_selector: ($) =>
      prec.left(
        PREC.CALL,
        seq(
          field("variable", $._expression),
          "!.",
          field(
            "selector",
            choice($.identifier, $.integer, $.parenthesized_expression),
          ),
        ),
      ),

    binary_expression: ($) =>
      choice(
        ...[
          [prec.left, "or", PREC.OR],
          [prec.left, "and", PREC.AND],
          [prec.left, "=", PREC.COMPARE],
          [prec.left, "<>", PREC.COMPARE],
          [prec.left, "<", PREC.COMPARE],
          [prec.left, ">", PREC.COMPARE],
          [prec.left, "<=", PREC.COMPARE],
          [prec.left, ">=", PREC.COMPARE],
          [prec.left, "in", PREC.COMPARE],
          [prec.left, "+", PREC.PLUS],
          [prec.left, "-", PREC.PLUS],
          [prec.left, "*", PREC.MULTI],
          [prec.left, "/", PREC.MULTI],
          [prec.left, "mod", PREC.MULTI],
          [prec.right, "^", PREC.POWER], // TODO: (fingolfin) actually, ^ is *NOT* associative in GAP at all,
          //  so an expression like `2^2^2` is a syntax error. Not sure how / whether to express that
        ].map(([fn, operator, precedence]) =>
          fn(precedence, seq($._expression, operator, $._expression)),
        ),
      ),

    unary_expression: ($) =>
      prec.left(PREC.UNARY, seq(choice("not", "+", "-"), $._expression)),

    // GAP source file location: src/scanner.c GetNumber
    integer: (_) =>
      lineContinuation(
        LITERAL_REGEXP.INTEGER,
        LITERAL_REGEXP.LINE_CONTINUATION,
      ),

    // GAP source file location: src/scanner.c GetNumber
    float: ($) =>
      choice(
        lineContinuation(
          LITERAL_REGEXP.NON_TRAILING_PERIOD_FLOAT,
          LITERAL_REGEXP.LINE_CONTINUATION,
        ),
        $._trailing_period_float,
        lineContinuation(
          LITERAL_REGEXP.EXPONENT_OR_CONVERSION_FLOAT,
          LITERAL_REGEXP.LINE_CONTINUATION,
        ),
      ),

    // GAP source file location: src/bool.c
    bool: (_) => choice("true", "false", "fail"),

    char: ($) =>
      seq(
        "'",
        choice(token.immediate(prec(1, /[^\\\r\n]/)), $.escape_sequence),
        "'",
      ),

    string: ($) => seq($.string_start, repeat($.string_content), $.string_end),

    string_content: ($) =>
      prec.right(repeat1(choice($.escape_sequence, $._string_content))),

    // GAP source file location: src/scanner.c GetEscapedChar
    escape_sequence: (_) =>
      lineContinuation(
        LITERAL_REGEXP.ESCAPE_SEQUENCE,
        LITERAL_REGEXP.LINE_CONTINUATION,
      ),

    // TODO: (fingolfin) restrict where tilde can be used, i.e., only "inside" a list or
    // record expression (but at arbitrary depth)
    tilde: (_) => "~",

    function: ($) =>
      seq(
        "function",
        field("parameters", $.parameters),
        optional(field("locals", $.locals)),
        optional(field("body", $._block)),
        "end",
      ),

    atomic_function: ($) =>
      seq(
        "atomic",
        "function",
        field("parameters", $.qualified_parameters),
        optional(field("locals", $.locals)),
        optional(field("body", $._block)),
        "end",
      ),

    lambda: ($) =>
      prec.right(
        PREC.LAMBDA,
        seq(
          field("parameters", $.lambda_parameters),
          "->",
          field("body", $._expression),
        ),
      ),

    parameters: ($) =>
      seq(
        "(",
        optional(seq(commaSep1($.identifier), optional($.ellipsis))),
        ")",
      ),

    qualified_parameters: ($) =>
      seq(
        "(",
        optional(
          seq(
            commaSep1(choice($.qualified_identifier, $.identifier)),
            optional($.ellipsis),
          ),
        ),
        ")",
      ),

    lambda_parameters: ($) =>
      choice(
        $.identifier,
        seq(
          "{",
          optional(seq(commaSep1($.identifier), optional($.ellipsis))),
          "}",
        ),
      ),

    ellipsis: (_) => "...",

    locals: ($) => seq("local", commaSep1($.identifier), ";"),

    call: ($) =>
      prec(
        PREC.CALL,
        seq(
          field(
            "function",
            choice(
              $._variable,
              $.parenthesized_expression,
              // Yes, you can define a function and immediately call it
              $.function,
              // But not an atomic function, for some reason!?
              // $.atomic_function
            ),
          ),
          field("arguments", $.argument_list),
        ),
      ),

    argument_list: ($) =>
      seq(
        "(",
        commaSep($._expression),
        optional(seq(":", commaSep($.function_call_option))),
        ")",
      ),

    // GAP source file location: src/read.c ReadFuncCallOption
    function_call_option: ($) =>
      choice($.identifier, $.parenthesized_expression, $.record_entry),

    // TODO: (fingolfin) add special rules for calls to Declare{GlobalFunction,Operation,...},
    // BindGlobal, BIND_GLOBAL, Install{Method,GlobalFunction,} ? They are not part of the language per se, but they
    // are how we can find out function declarations / definitions
    // NOTE: (reiniscirpons) not sure we need to do anything specials for these functions in the grammar itself.
    // We can maybe distinguish them in ./queries/highlights.scm as builtin functions. When parsing they should be
    // treated the same as any other function call I think.

    list_expression: ($) => seq("[", commaSep(optional($._expression)), "]"),

    range_expression: ($) => {
      const valid_index_expressions = choice(
        $._variable,
        $.binary_expression,
        $.unary_expression,

        $.integer,

        $.permutation_expression,

        $.parenthesized_expression,
      );

      return seq(
        "[",
        field("first", valid_index_expressions),
        optional(seq(",", field("second", valid_index_expressions))),
        "..",
        field("last", valid_index_expressions),
        "]",
      );
    },

    // GAP source file location: src/read.c ReadRec
    record_expression: ($) =>
      seq("rec", "(", commaSep($.record_entry), optional(","), ")"),

    record_entry: ($) =>
      seq(
        field(
          "left",
          choice($.identifier, $.integer, $.parenthesized_expression),
        ),
        ":=",
        field("right", $._expression),
      ),

    permutation_expression: ($) =>
      choice(
        seq("(", ")"),
        prec.right(repeat1($.permutation_cycle_expression)),
      ),

    // Does not include trivial cycle because GAP doesn't allow it in a permutation expression,
    // i.e. (1,2)() and ()(1,2) throw a syntax error.
    permutation_cycle_expression: ($) =>
      seq("(", seq($._expression, ",", commaSep1($._expression)), ")"),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    // TODO: (reiniscirpons): Match the `@` character separately for
    // identifiers to allow for namespace determination.
    // See Chapter 4.10 of the GAP reference manual
    // https://docs.gap-system.org/doc/ref/chap4.html#X7DF8774F7D542298
    // for more details.
    identifier: (_) =>
      lineContinuation(
        LITERAL_REGEXP.IDENTIFIER,
        LITERAL_REGEXP.LINE_CONTINUATION,
      ),

    qualified_identifier: ($) => seq($.qualifier, $.identifier),

    qualifier: (_) => choice("readonly", "readwrite"),

    pragma: (_) => token(seq("#%", /.*/)),

    comment: (_) => token(seq("#", /.*/)),

    // GAP source file location: src/io.c GetNextChar
    _line_continuation: (_) => LITERAL_REGEXP.LINE_CONTINUATION,

    // GAP source file location: src/scanner.c GetHelp
    // GAP source file location: src/intrprtr.c IntrHelp
    // GAP source file location: lib/helpbase.gi HELP
    help_statement: ($) =>
      choice(
        seq("?", /;*\r?\n/),
        seq(
          "?",
          optional(
            choice(
              alias(LITERAL_REGEXP.HELP_TOPIC_OR_BOOK, $.help_topic),
              seq(
                alias(LITERAL_REGEXP.HELP_TOPIC_OR_BOOK, $.help_book),
                ":",
                optional("?"),
                optional(
                  alias(/[^?\r\n;]|[^?\r\n][^\r\n]*[^\r\n;]/, $.help_topic),
                ),
              ),
              alias(/[-+&<>]|<<|>>/, $.help_operator),
              alias(/[0-9]+/, $.help_selector),
            ),
          ),
          repeat(";"),
          /\r?\n/,
        ),
      ),
  },
});

function commaSep(rule) {
  return optional(commaSep1(rule));
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}

// This function implements a RegExp transformation for matching an
// arbitrary number of line continuations within the base RegExp.
// Roughly speaking, if L is the regex matching the line continuation,
// and T is this function, then
//   T(x) = (xL*) if x is a character class
//   T((A)) = (T(A))
//   T(AB) = T(A)T(B)
//   T(A | B) = T(A) | T(B)
//   T(A*) = T(A)*
// We perform this transformation in a linear pass by essentially detecting
// occurrences of character classes and performing the transformation on them.
function lineContinuation(base_regex, line_continuation_regex) {
  // The irony of writing a custom regex parser within a tree-sitter
  // grammar is not lost, but here we are.
  // <RegExp> ::= <CharacterClass>
  //            | '(', <RegExp>, ')'
  //            | <RegExp>, <RegExp>
  //            | <RegExp>, '|', <RegExp>
  //            | <RegExp>, <Quantifier>
  // <Quantifier> ::= '*' | '+' | '?'
  //                | '*?' | '+?' | '??'
  //                | '{', <Integer>, '}'
  //                | '{', <Integer>, ',}'
  //                | '{', <Integer>, ',', <Integer>, '}'
  //                | '{', <Integer>, '}?'
  //                | '{', <Integer>, ',}?'
  //                | '{', <Integer>, ',', <Integer>, '}?'
  // <CharacterClass> ::= '[', <StuffThatMayContainEscapedRightSquareBracket>, ']'
  //                    | '\\', <AnyLetterToAGoodApproximation>,
  //                    | <AnyNonQuantifierLetterToAGoodApproximation>
  const line_continuation_regex_string =
    "(" + line_continuation_regex.source + ")*";
  const special_symbols = new Set(["*", "+", "?", "|", "(", ")"]);
  let result_regex_string = "";
  let escaped = false;
  let square_bracket = false;
  let curly_brace = false;
  for (const c of base_regex.source) {
    // TODO: (reiniscirpons) Refactor more

    // BEFORE
    if (
      !curly_brace &&
      !square_bracket &&
      !escaped &&
      (c == "\\" || c == "[" || (c != "{" && !special_symbols.has(c)))
    ) {
      result_regex_string = result_regex_string.concat("(");
    }

    result_regex_string = result_regex_string.concat(c);

    // AFTER
    if (
      (!curly_brace && !escaped && square_bracket && c == "]") ||
      (!square_bracket && escaped) ||
      (!curly_brace &&
        !square_bracket &&
        !escaped &&
        c != "\\" &&
        c != "[" &&
        c != "{" &&
        !special_symbols.has(c))
    ) {
      result_regex_string = result_regex_string.concat(
        line_continuation_regex_string,
      );
      result_regex_string = result_regex_string.concat(")");
    }

    // FLAGS
    if (curly_brace && c == "}") {
      curly_brace = false;
    } else if (!curly_brace && escaped) {
      escaped = false;
    } else if (!curly_brace && !escaped && square_bracket && c == "]") {
      square_bracket = false;
    } else if (!curly_brace && !escaped && c == "\\") {
      escaped = true;
    } else if (!curly_brace && !square_bracket && !escaped && c == "[") {
      square_bracket = true;
    } else if (!curly_brace && !square_bracket && !escaped && c == "{") {
      curly_brace = true;
    }
  }
  return RegExp(result_regex_string);
}
