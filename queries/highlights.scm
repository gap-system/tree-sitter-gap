; highlights.scm

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