const PREC = {
  COMMA: -1,
  PRIORITY: 1,

  // in the following, we mention the names of the corresponding
  // GAP kernel function
  OR: 1,        // ReadExpr => or
  AND: 2,       // ReadAnd => and
  COMPARE: 3,   // ReadRel => = <> < > <= >= in
  PLUS: 9,      // ReadAri => + - (binary)
  MULTI: 10,    // ReadTerm => * / mod
  UNARY: 11,    // ReadFactor => not + - (unary)
  POWER: 12,    // ReadFactor => ^
  FUNC: 13,     // ReadFuncExprAbbrevSingle, ReadFuncExprAbbrevMulti => ->
}

module.exports = grammar({
  name: 'GAP',

  extras: $ => [
    $.comment,
    /\s/
  ],

  inline: $ => [
    $._expression,
    $._statement
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
      $.return_statement
      // TODO: should we handle `Unbind`, `Info`, `Assert`, `TryNextMethod`
      // statements? For now, we get away with just treating them as
      // procedure calls

      // TODO: add support for atomic statements

      // TODO: add support for `quit`, `QUIT`, `?`, pragmas ???
    ),

    assignment_statement: $ => seq(
      $._expression,
      ':=',
      $._expression,
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
      field('left', $.identifier),
      'in',
      field('right', seq($._expression)),
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
      //$.call_expression,

      $.integer,
      $.true,
      $.false,
      $.char,
      $.string,
//       $.function,
//       $.short_function,
      $.tilde,

      $.list_expression,
      $.record_expression,
      $.permutation_expression,

      $.parenthesized_expression
    ),
    // TODO: ensure this is forbidden:

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
        [prec.right, '^', PREC.POWER],  // TODO: actually, ^ is *NOT* associative in GAP at all
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

    integer: $ => /[0-9]+/,

    true: $ => 'true',

    false: $ => 'false',

    char: $ => seq(
      '\'',
      token.immediate(/[^\n']/),
      // TODO: escape characters
      '\''
    ),

    string: $ => seq(
      '"',
      token.immediate(/[^\n"]*/),
      // TODO: support escapes
      // TODO: support triple quoted strings
      '"',
    ),

    function: $ => seq(
      'function',
      '(',
      commaSep($.identifier),
      ')',
      optional(seq("local", commaSep1($.identifier),";")),
      field('body', repeat($._statement)), // TODO: should we use field in more places?
      'end'
    ),

    // TODO: make sure precedence is correct, e.g.
    //  x -> x^2  must parse correctly;
    // perhaps turn this into a right associative operator?
    short_function: $ => prec.right(PREC.FUNC, seq(
      choice(
        $.identifier,
        seq('{', commaSep($.identifier), '},' )
      ),
      '->',
      $._expression
    )),

    // TODO: restrict where tilde can be used, i.e., only "inside" a list or
    // record expression (but at arbitrary depth)
    tilde: $ => '~',

    short_multi_function: $ => seq(
      '->',
      $._expression
    ),

    list_expression: $ => seq(
      '[',
      commaSep(optional($._expression)),
      ']',
    ),

    record_expression: $ => seq(
      'rec',
      '(',
      commaSep(
        seq(choice($.identifier, $.integer), ':=', $._expression)
       ),
      ')',
    ),

    permutation_expression: $ => seq(
      '(',
      seq($._expression, ',', $._expression, repeat(seq(',', $._expression))),
      ')',
    ),

    parenthesized_expression: $ => seq(
      '(',
      $._expression,
      ')',
    ),

    // TODO: add tilde expressions?

    // TODO: support backslash quotes in identifiers; e.g. these are
    // three valid identifiers:
    //   \[\]
    //   \+
    //   multi\ word\ identifier
    identifier: $ => /[a-zA-Z_@][a-zA-Z_@0-9]*/,

    comment: $ => token(seq('#', /.*/))

  }
});

function commaSep(rule) {
  return optional(commaSep1(rule))
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
}
