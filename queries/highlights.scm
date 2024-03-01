; Constants

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

; Other identifiers

(identifier) @variable

; Literals

(bool) @constant.builtin
(tilde) @variable.builtin
(integer) @number
(float) @number.float
(comment) @comment @spell
(string) @string
(char) @character
(escape_sequence) @string.escape


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


[
  "atomic"
  (break_statement)
  (continue_statement)
  "readonly"
  "readwrite"
  "rec"
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

[
  "("
  ")"
  "["
  "!["
  "]"
  "{"
  "}"
] @punctuation.bracket
