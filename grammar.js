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

const LITERAL_REGEXP = {
  IDENTIFIER: /([a-zA-Z_@0-9]|\\.)*([a-zA-Z_@]|\\.)[a-zA-Z_@0-9]*/,
  INTEGER: /[0-9]+/,
  ESCAPE_SEQUENCE: /\\([^0-7\r\n]|0x[0-9a-fA-F]{2,2}|[0-7]{3,3})/,
  LINE_CONTINUATION: /\\\r?\n/,
}

module.exports = grammar({
  name: 'GAP',

  externals: $ => [
    $.string_start,
    $._string_content,
    $.string_end,
  ],

  extras: $ => [
    $.comment,
    /\s/,
    $._line_continuation,
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
    // The parameters of an atomic function do not necessarily have to use the
    // `readonly` and `readwrite` qualifiers. Therefore the two parameter lists
    // have an inherent conflict.
    [$.parameters, $.qualified_parameters],
  ],

  word: $ => $.identifier,

  rules: {
    // TODO: add support for GAP tst file syntax. This probably needs to be
    // a separate tree-sitter project which imports the base GAP syntax, similar
    // to how the cpp grammar is implemented (it imports the c grammar).
    source_file: $ => repeat(
        choice(
            seq($._expression, ';'),
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
      $.atomic_statement,
      $.break_statement,
      $.continue_statement,
      $.return_statement,
      $.call, // procedure call
      // TODO: should we handle `Unbind`, `Info`, `Assert`, `TryNextMethod`
      // statements? For now, we get away with just treating them as
      // procedure calls


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
      field('identifier', $.identifier),
      'in',
      field('values', $._expression),
      'do',
      repeat($._statement),
      'od'
    ),

    // GAP source file location: src/read.c ReadAtomic
    atomic_statement: $ => seq(
      'atomic',
      field("qualified_expressions",
        commaSep1(choice(
          $.qualified_expression,
          $._expression,
        )),
      ),
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

      $.parenthesized_expression
    ),

    // GAP source file location: src/read.c ReadQualifiedExpr
    qualified_expression: $ => seq(
      $.qualifier,
      $._expression
    ),

    // Variables

    // GAP source file location: src/read.c ReadCallVarAss
    _variable: $ => prec(-1, choice(
      $.identifier,
      $.list_selector,
      $.sublist_selector,
      $.positional_selector,
      $.record_selector,
      $.component_selector,
      $.call
    )),

    // GAP source file location: src/read.c ReadSelector
    list_selector: $ => prec.left(PREC.CALL, seq(
      field('variable', $._expression),
      '[',
      $._expression,
      optional(seq(
        ',',
        $._expression
      )),
      ']'
    )),

    // GAP source file location: src/read.c ReadSelector
    sublist_selector: $ => prec.left(PREC.CALL, seq(
      field('variable', $._expression),
      '{',
      $._expression,
      '}'
    )),

    // GAP source file location: src/read.c ReadSelector
    positional_selector: $ => prec.left(PREC.CALL, seq(
      field('variable', $._expression),
      '![',
      $._expression,
      ']'
    )),

    // GAP source file location: src/read.c ReadSelector
    // TODO: fix issues with integer record selectors, i.e.
    // make sure that a.1 is not parsed as (identifier) (float)
    record_selector: $ => prec.left(PREC.CALL, seq(
      field('variable', $._expression),
      '.',
      field('selector', choice(
        $.identifier,
        $.integer,
        $.parenthesized_expression,
      ))
    )),

    // GAP source file location: src/read.c ReadSelector
    component_selector: $ => prec.left(PREC.CALL, seq(
      field('variable', $._expression),
      '!.',
      field('selector', choice(
        $.identifier,
        $.integer,
        $.parenthesized_expression,
      ))
    )),

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
    integer: $ => lineContinuation(
      LITERAL_REGEXP.INTEGER,
      LITERAL_REGEXP.LINE_CONTINUATION,
    ),

    // GAP source file location: src/scanner.c GetNumber
    float: _ => {
      // TODO: trailing period floats currently cause issues with ranges e.g.
      // [1..10] fails producing the parse (list_expression (float) (Error))
      // since it (correctly) tries to parse the prefix [1. as the start of a list
      // followed by the float "1.". The issue is that with only a single character of
      // lookahead we cannot correctly disambiguate this situation.
      // In particular we need two characters of lookahead when our parser has processed
      // the prefix [1, with these two characters we check if we have 1. or 1.. .
      // Looks like we need to add an external scanner for this.
      const trailing_period = lineContinuation(
        /[0-9]+\./,
        LITERAL_REGEXP.LINE_CONTINUATION,
      );

      const middle_period = lineContinuation(
        /[0-9]+\.[0-9]+/,
        LITERAL_REGEXP.LINE_CONTINUATION,
      );

      // TODO: Leading periods currently conflict with record selectors
      const leading_period = lineContinuation(
        /\.[0-9]+/,
        LITERAL_REGEXP.LINE_CONTINUATION,
      );

      const float_with_exponent = lineContinuation(
        /([0-9]+\.[0-9]*|[0-9]*\.[0-9]+)[edqEDQ][\+-]?[0-9]+/,
        LITERAL_REGEXP.LINE_CONTINUATION,
      );

      return choice(
        //leading_period,
        middle_period,
        //trailing_period,
        float_with_exponent,
      );
    },

    // GAP source file location: src/bool.c
    bool: _ => choice('true', 'false', 'fail'),

    char: $ => seq(
      '\'',
      choice(
        token.immediate(prec(1, /[^\\\r\n]/)),
        $.escape_sequence
      ),
      '\''
    ),

    string: $ => seq(
      $.string_start,
      repeat($.string_content),
      $.string_end,
    ),

    string_content: $ => prec.right(repeat1(choice(
      $.escape_sequence,
      $._string_content,
    ))),

    // GAP source file location: src/scanner.c GetEscapedChar
    escape_sequence: _ => lineContinuation(
      LITERAL_REGEXP.ESCAPE_SEQUENCE,
      LITERAL_REGEXP.LINE_CONTINUATION,
    ),

    // TODO: restrict where tilde can be used, i.e., only "inside" a list or
    // record expression (but at arbitrary depth)
    tilde: $ => '~',


    function: $ => seq(
      'function',
      field('parameters', $.parameters),
      field('locals', optional($.locals)),
      field('body', optional($.block)),
      'end'
    ),

    atomic_function: $ => seq(
      'atomic',
      'function',
      field('parameters', $.qualified_parameters),
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

    qualified_parameters: $ => seq(
      '(',
      optional(seq(
        commaSep1(choice(
          $.qualified_identifier,
          $.identifier,
        )),
        optional($.ellipsis),
      )),
      ')',
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

    call: $ => prec(PREC.CALL, seq(
      field('function', choice(
        $._variable,
        $.parenthesized_expression,
        // Yes, you can define a function and immediately call it
        $.function
        // But not an atomic function, for some reason!?
        // $.atomic_function
      )),
      field('arguments', $.argument_list)
    )),

    argument_list: $ => choice(
      seq(
        '(',
        commaSep($._expression),
        optional(seq(
          ':',
          commaSep($.function_call_option),
        )),
        ')'
      )
    ),

    // GAP source file location: src/read.c ReadFuncCallOption
    function_call_option: $ => choice(
      $.identifier,
      $.parenthesized_expression,
      $.record_entry
    ),

    // TODO: add special rules for calls to Declare{GlobalFunction,Operation,...},
    // BindGlobal, BIND_GLOBAL, Install{Method,GlobalFunction,} ? They are not part of the language per se, but they
    // are how we can find out function declarations / definitions

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
      field('left', choice(
        $.identifier,
        $.integer,
        $.parenthesized_expression
      )),
      ':=',
      field('right', $._expression)
    ),

    permutation_expression: $ => choice(
      seq('(', ')'),
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

    identifier: $ => lineContinuation(
      LITERAL_REGEXP.IDENTIFIER,
      LITERAL_REGEXP.LINE_CONTINUATION,
    ),

    qualified_identifier: $ => seq(
      $.qualifier,
      $.identifier
    ),

    qualifier: _ => choice('readonly', 'readwrite'),

    comment: _ => token(seq('#', /.*/)),

    // GAP source file location: src/io.c GetNextChar
    _line_continuation: _ => LITERAL_REGEXP.LINE_CONTINUATION,


  }
});

function commaSep(rule) {
  return optional(commaSep1(rule))
}

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
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
  const line_continuation_regex_string = '(' + line_continuation_regex.source + ')*'
  const special_symbols = new Set(['*', '+', '?', '|', '(', ')'])
  let result_regex_string = '';
  let escaped = false;
  let square_bracket = false;
  let curly_brace = false
  for (const c of base_regex.source) {
    // TODO: refactor code spaghetti
    if (curly_brace) {
      if (c == '}') {
        curly_brace = false
        result_regex_string = result_regex_string.concat(c)
      } else {
        result_regex_string = result_regex_string.concat(c)
      }
    } else if (square_bracket) {
      if (escaped) {
        escaped = false
        result_regex_string = result_regex_string.concat(c)
      } else if (c == ']') {
        square_bracket = false;
        result_regex_string = result_regex_string.concat(c)
        result_regex_string = result_regex_string.concat(line_continuation_regex_string)
        result_regex_string = result_regex_string.concat(')')
      } else if (c == '\\') {
        escaped = true;
        result_regex_string = result_regex_string.concat(c)
      } else {
        result_regex_string = result_regex_string.concat(c)
      }
    } else if (escaped) {
        escaped = false;
        result_regex_string = result_regex_string.concat(c)
        result_regex_string = result_regex_string.concat(line_continuation_regex_string)
        result_regex_string = result_regex_string.concat(')')
    } else if (c == '\\') {
      escaped = true;
      result_regex_string = result_regex_string.concat('(')
      result_regex_string = result_regex_string.concat(c)
    } else if (c == '[') {
      square_bracket = true;
      result_regex_string = result_regex_string.concat('(')
      result_regex_string = result_regex_string.concat(c)
    } else if (c == '{') {
      curly_brace = true;
      result_regex_string = result_regex_string.concat(c)
    } else if (special_symbols.has(c)) {
      result_regex_string = result_regex_string.concat(c)
    } else {
      result_regex_string = result_regex_string.concat('(')
      result_regex_string = result_regex_string.concat(c)
      result_regex_string = result_regex_string.concat(line_continuation_regex_string)
      result_regex_string = result_regex_string.concat(')')
    }
  }
  return RegExp(result_regex_string);
}
