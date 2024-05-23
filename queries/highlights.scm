; Constants

; NOTE: (reiniscirpons) in case multiple queries match, last query wins. So
; queries should go from least specific to most specific. (This is the default
; behaviour since tree-sitter 0.22.2)
(identifier) @variable

; convention: constants are of the form ALL_CAPS_AND_UNDERSCORES and have length at least 2
((identifier) @constant
 (#match? @constant "^[A-Z_][A-Z_]+$"))

; Functions

(assignment_statement
  left: (identifier) @function
  right: (function))

(assignment_statement
  left: (identifier) @function
  right: (atomic_function))

(assignment_statement
  left: (identifier) @function
  right: (lambda))

(call
  function: (identifier) @function.call)

((call
  function: (identifier) @function.builtin)
 (#match? @function.builtin "^(Assert|Info|IsBound|Unbind|TryNextMethod)$"))

; Function parameters

(parameters
  (identifier) @variable.parameter)

(qualified_parameters
  (identifier) @variable.parameter)

(qualified_parameters
  (qualified_identifier
    (identifier) @variable.parameter))

(lambda_parameters
  (identifier) @variable.parameter)

(locals
  (identifier) @variable.parameter)

; Literals

(bool) @constant.builtin
(tilde) @variable.builtin
(integer) @number
(float) @number.float
(comment) @comment @spell
(string) @string
(char) @character
(escape_sequence) @string.escape
(pragma) @keyword.directive


[
  "+"
  "-"
  "*"
  "/"
  "^"
  "->"
  ":="
  "<"
  "<="
  "<>"
  "="
  ">"
  ">="
  ".."
  (ellipsis)
] @operator

(help_statement
  (help_operator) @operator)


[
  "atomic"
  (break_statement)
  (continue_statement)
  "readonly"
  "readwrite"
  "rec"
  (quit_statement)
] @keyword

[
  "and"
  "in"
  "mod"
  "not"
  "or"
] @keyword.operator

[
  "function"
  "local"
  "end"
] @keyword.function

[
  "for"
  "while"
  "do"
  "od"
  "repeat"
  "until"
] @keyword.repeat

[
  "if"
  "then"
  "elif"
  "else"
  "fi"
] @keyword.conditional

"return" @keyword.return

[
  ","
  ";"
  "."
  "!."
  ":"
] @punctuation.delimiter

(help_statement "?" @punctuation.special)

[
 (help_topic)
 (help_book)
] @string.special

[
  "("
  ")"
  "["
  "!["
  "]"
  "{"
  "}"
] @punctuation.bracket

; Record selectors as properties

(record_entry
  left: [
    (identifier)
    (integer)
  ] @property)


(record_selector
  selector: [
    (identifier)
    (integer)
  ] @property)

(component_selector
  selector: [
    (identifier)
    (integer)
  ] @property)

(function_call_option
  (identifier) @property)
