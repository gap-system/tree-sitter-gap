; highlights.scm
; based on https://github.com/tree-sitter/tree-sitter-python/blob/master/queries/highlights.scm

; convention: identifiers that start with upper case are "global"
;((identifier) @constructor
; (#match? @constructor "^[A-Z]"))

; convention: constants are of the form ALL_CAPS_AND_UNDERSCORES and have length at least 2
((identifier) @constant
 (#match? @constant "^[A-Z_][A-Z_]+$"))


; Function calls

(call
  function: (identifier) @function)

; Builtin functions

((call
  function: (identifier) @function.builtin)
 (#match?
   @function.builtin
   "^(Assert|Info|IsBound|Unbind|TryNextMethod)$"))

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

; Any other identifier is a variable
(identifier) @variable


; Literals

[
  (bool)
] @constant.builtin

[
  (tilde)
] @variable.builtin

[
  (integer)
  (float)
] @number

(comment) @comment
(string) @string
(char) @string
(escape_sequence) @escape

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
  "and"
  "in"
  "mod"
  "not"
  "or"
  ".."
  (ellipsis)
] @operator

[
  "atomic"
  (break_statement)
  (continue_statement)
  "do"
  "elif"
  "else"
  "end"
  "fi"
  "for"
  "function"
  "if"
  "local"
  "od"
  "readonly"
  "readwrite"
  "rec"
  "repeat"
  "return"
  "then"
  "until"
  "while"
] @keyword

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
