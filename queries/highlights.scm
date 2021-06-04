; highlights.scm
; based on https://github.com/tree-sitter/tree-sitter-python/blob/master/queries/highlights.scm

; Builtin functions

((call
  function: (identifier) @function.builtin)
 (#match?
   @function.builtin
   "^(Assert|Info|IsBound|Unbind|TryNextMethod)$"))

; Function calls
(call
  function: (identifier) @function)

; convention: identifiers that start with upper case are "global"
;((identifier) @constructor
; (#match? @constructor "^[A-Z]"))

; convention: constants are of the form ALL_CAPS_AND_UNDERSCORES
((identifier) @constant
 (#match? @constant "^[A-Z][A-Z_]*$"))

; any other identifier is a variable
;((identifier) @constant
; (#is-not? local))
(identifier) @variable

; Literals

[
  (true)
  (false)
] @constant.builtin

[
  (integer)
  ;(float)
] @number

(comment) @comment
(string) @string
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
] @operator

[
  ;"atomic"
  ;"break"  ; FIXME why does this give an error???
  ;"continue" ; FIXME why does this give an error???
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
  ;"readonly"
  ;"readwrite"
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
  ;"."
  ;"!."
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket