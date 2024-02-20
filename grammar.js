const PREC = {
  // in the following, we mention the names of the corresponding
  // GAP kernel function
  LAMBDA: 0,    // ReadFuncExprAbbrevSingle, ReadFuncExprAbbrevMulti => ->
  OR: 1,        // ReadExpr => or
  AND: 2,       // ReadAnd => and
  COMPARE: 3,   // ReadRel => = <> < > <= >= in
  PLUS: 9,      // ReadAri => + - (binary)
  MULTI: 10,    // ReadTerm => * / mod
  UNARY: 11,    // ReadFactor => not + - (unary)
  POWER: 12,    // ReadFactor => ^
  CALL: 13,
}

module.exports = grammar({
  name: 'GAP',

  extras: $ => [
    $.comment,
    /\s/,
    $.line_continuation
  ],

  inline: $ => [
    $._expression,
    $._statement
  ],
  
  conflicts: $ => [
    // on the top level, both statements and expressions are allowed note that
    // $.call can appear both as an expression (function call) or statement
    // (procedure call), and we need to resolve that ambiguity
    [$.source_file, $._statement_inner],
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat(
        choice(
            $._expression,
            $._statement
        )),

    // Statements
    _statement: $ => choice(
      seq($._statement_inner, ';'),
      ';' // empty statement
    ),

    _statement_inner: $ => choice(
      $.assignment_statement,
      $.if_statement,
      $.while_statement,
      $.repeat_statement,
      $.for_statement,
      $.break_statement,
      $.continue_statement,
      $.return_statement,
      $.call, // procedure call
      // TODO: should we handle `Unbind`, `Info`, `Assert`, `TryNextMethod`
      // statements? For now, we get away with just treating them as
      // procedure calls

      // TODO: add support for atomic statements

      // TODO: add support for `quit`, `QUIT`, `?`, pragmas ???
    ),

    assignment_statement: $ => seq(
      field('left', $._expression),
      ':=',
      field('right', $._expression),
    ),

    if_statement: $ => seq(
      'if',
      field('condition', $._expression),
      'then',
      repeat($._statement),
      repeat($.elif_clause),
      optional($.else_clause),
      'fi'
    ),

    elif_clause: $ => seq(
      'elif',
      field('condition', $._expression),
      'then',
      repeat($._statement),
    ),

    else_clause: $ => seq(
      'else',
      repeat($._statement),
    ),

    while_statement: $ => seq(
      'while',
      field('condition', $._expression),
      'do',
      repeat($._statement),
      'od'
    ),

    repeat_statement: $ => seq(
      'repeat',
      repeat($._statement),
      'until',
      field('condition', $._expression)
    ),

    for_statement: $ => seq(
      'for',
      field('variable', $.identifier),
      'in',
      field('values', seq($._expression)),
      'do',
      repeat($._statement),
      'od'
    ),

    break_statement: $ => 'break',

    continue_statement: $ => 'continue',

    return_statement: $ => seq(
      'return',
      optional($._expression)
    ),

    // Expressions

    _expression: $ => choice(
      $.identifier,
      $.binary_expression,
      $.unary_expression,

      // TODO:  a[idx], a[idx,idx],  a{...}, a![], a!{}
      // TODO:  a.x, a!.x
      // TODO: floats (and be careful so that also edge cases are supported:
      //       1. or .1 or 1.e4 ;  while record.1 or a.1.1 or e.1 are all not floats)

      $.integer,
      $.float,
      $.true,
      $.false,
      $.tilde,
      $.char,
      $.string,
      $.function,
      $.lambda,
      $.call, // function call

      $.list_expression,
      $.range_expression,
      $.record_expression,
      $.permutation_expression,

      $.parenthesized_expression
    ),

    binary_expression: $ => choice(
      ...[
        [prec.left, 'or', PREC.OR],
        [prec.left, 'and', PREC.AND],
        [prec.left, '=', PREC.COMPARE],
        [prec.left, '<>', PREC.COMPARE],
        [prec.left, '<', PREC.COMPARE],
        [prec.left, '>', PREC.COMPARE],
        [prec.left, '<=', PREC.COMPARE],
        [prec.left, '>=', PREC.COMPARE],
        [prec.left, 'in', PREC.COMPARE],
        [prec.left, '+', PREC.PLUS],
        [prec.left, '-', PREC.PLUS],
        [prec.left, '*', PREC.MULTI],
        [prec.left, '/', PREC.MULTI],
        [prec.left, 'mod', PREC.MULTI],
        [prec.right, '^', PREC.POWER],  // TODO: actually, ^ is *NOT* associative in GAP at all,
        //  so an expression like `2^2^2` is a syntax error. Not sure how / whether to express that
      ].map(([fn, operator, precedence]) => fn(precedence, seq(
        $._expression,
        operator,
        $._expression
      )))
    ),

    unary_expression: $ => prec.left(PREC.UNARY, seq(
      choice('not', '+', '-'),
      $._expression
    )),


    // GAP source file location: src/scanner.c GetNumber
    float: _ => {
      const digits = /[0-9]+/;
      const exponent = /[edqEDQ][\+-]?[0-9]+/;
      const leading_period = token(seq(
        optional(digits),
        '.',
        digits,
        optional(exponent),
      ));
      const trailing_period_with_exponent = token(seq(
        digits,
        '.',
        exponent,
      ));

      // TODO: trailing period floats currently cause issues with ranges e.g.
      // [1..10] fails producing the parse (list_expression (float) (Error))
      // since it (correctly) tries to parse the prefix [1. as the start of a list
      // followed by the float "1.". The issue is that with only a single character of
      // lookahead we cannot correctly disambiguate this situation.
      // In particular we need two characters of lookahead when our parser has processed
      // the prefix [1, with these two characters we check if we have 1. or 1.. .
      // Looks like we need to add an external scanner for this.
      const trailing_period = token(seq(
        digits,
        '.',
      ));

      return choice(
        leading_period,
        trailing_period_with_exponent, 
        //trailing_period
      );
    },

    // GAP source file location: src/scanner.c GetNumber
    integer: $ => /[0-9]+/,

    true: $ => 'true',

    false: $ => 'false',

    char: $ => seq(
      '\'',
      choice(
        token.immediate(/[^\n']/),
        $.escape_sequence
      ),
      '\''
    ),

    // TODO: support multiline triple strings
    // (ruby and python modules use an external scanner written in C++
    // for that... there are some nasty edge cases)
    string: $ => choice(
      seq(
        '"',
        optional($._literal_contents),
        '"',
      ),
      seq(
        '"""',
        optional(repeat1(choice(
          token.immediate(/./),
          $.escape_sequence
        ))),
        '"""',
      )
    ),

    _literal_contents: $ => repeat1(choice(
      token.immediate(/[^\n"\\]/),
      $.escape_sequence
    )),

    // TODO: Properly handle line continuation characters in strings.
    // Currently the test
    // "abc\
    // def"
    // Gets parsed as 
    // (string (escape_sequence))
    // instead of 
    // (string) (line_continuation) (string)
    // Likely easiest to fix when implementing proper line continuation logic.
    escape_sequence: _ => token(seq(
      '\\',
      choice(
        /[^0-7]/,             // single character
        /0x[0-9a-fA-F]{2,2}/, // hex code
        /[0-7]{3,3}/,         // octal
      )
    )),


    function: $ => seq(
      'function',
      field('parameters', $.parameters),
      field('locals', optional($.locals)),
      field('body', optional($.block)),
      'end'
    ),

    block: $ => repeat1($._statement),

    lambda: $ => prec.right(PREC.LAMBDA, seq(
      field('parameters', $.lambda_parameters),
      '->',
      field('body', $._expression)
    )),

    parameters: $ => seq(
      '(',
      optional(seq(
        commaSep1($.identifier),
        optional($.ellipsis)
      )),
      ')'
    ),

    lambda_parameters: $ => choice(
      $.identifier,
      seq(
        '{',
        optional(seq(
          commaSep1($.identifier),
          optional($.ellipsis)
        )),
        '}'
      )
    ),

    ellipsis: _ => '...',

    locals: $ => seq(
      "local", commaSep1($.identifier), ";"
    ),

    // TODO: restrict where tilde can be used, i.e., only "inside" a list or
    // record expression (but at arbitrary depth)
    tilde: $ => '~',

    // TODO: should also handle calls like `(f)()` `f()()`
    // or `a[1]()` but these are rare, so we defer implementing it for now
    // also should handle `a.b()` correctly (as `(a.b)()` not `a.(b())`)
    call: $ => prec(PREC.CALL, seq(
      field('function', $.identifier),
      field('arguments', $.argument_list)
    )),

    argument_list: $ => choice(
      // Need to have the empty call separately to disambiguate with empty
      // permutation. This is possibly due to the "Match Specificity" rule in the
      // tree-sitter spec.
      '()',
      seq(
        '(',
        commaSep1($._expression),
        ')'
      ),
      seq(
        '(',
        commaSep($._expression),
        ':',
        commaSep($.function_call_option),
        ')'
      )
    ),

    // GAP source file location: src/read.c ReadFuncCallOption
    function_call_option: $ => choice(
      $.identifier,
      seq('(', $._expression, ')'),
      $.record_entry
    ),

    // TODO: add special rules for calls to Declare{GlobalFunction,Operation,...},
    // BindGlobal, BIND_GLOBAL, Install{Method,GlobalFunction,} ? They are not part of the language per se, but they
    // are how we can find out function declarations / definitions
    // Dec

    list_expression: $ => seq(
      '[',
      commaSep(optional($._expression)),
      ']',
    ),

    range_expression: $ => seq(
      '[',
      field('first', $._expression),
      optional(seq(
          ',',
          field('second', $._expression),
      )),
      '..',
      field('last', $._expression),
      ']',
    ),

    // GAP source file location: src/read.c ReadRec
    record_expression: $ => seq(
      'rec',
      '(',
      commaSep(
        $.record_entry
      ),
      optional(','),
      ')',
    ),

    record_entry: $ => seq(
      choice(
        $.identifier,
        $.integer,
        seq('(', $._expression, ')')
      ),
      ':=',
      $._expression
    ),

    permutation_expression: $ => choice(
      '()',
      prec.right(repeat1($.permutation_cycle_expression))
    ),

    // Does not include trivial cycle because GAP doesn't allow it in a permutation expression,
    // i.e. (1,2)() and ()(1,2) throw a syntax error.
    permutation_cycle_expression: $ => seq(
      '(',
      seq($._expression, ',', commaSep1($._expression)),
      ')'
    ),

    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')',
    ),

    // TODO: support backslash quotes in identifiers; e.g. these are
    // three valid identifiers:
    //   \[\]
    //   \+
    //   multi\ word\ identifier
    identifier: _ => /[a-zA-Z_@][a-zA-Z_@0-9]*/,

    comment: _ => token(seq('#', /.*/)),

    // TODO: make line continuations seamless, i.e. parse 
    // 1234\
    // 5678
    // as just (integer) instead of ((integer) (line_continuation) (integer))
    line_continuation: _ => token(seq('\\', choice(seq(optional('\r'), '\n'), '\0'))),

  }
});

function commaSep(rule) {
  return optional(commaSep1(rule))
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
}
