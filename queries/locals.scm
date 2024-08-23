; The only other scopes apart from the global scope occur in function
; definitions.
[
  (source_file)
  (lambda)
  (function)
  (atomic_function)
] @local.scope

; TODO: (reiniscirpons) figure out if last match wins for local queries as well.
; If not move this to end.
(identifier) @local.reference

(assignment_statement
  left: (identifier) @local.definition.var)

(locals
  (identifier) @variable.definition.var)

(for_statement
  identifier: (identifier) @variable.definition.var)

(assignment_statement
  left: (identifier) @local.definition.function
  right: [
    (lambda)
    (function)
    (atomic_function)
  ])

(parameters
  (identifier) @local.definition.parameter)

(qualified_parameters
  (identifier) @local.definition.parameter)

(qualified_parameters
  (qualified_identifier
    (identifier) @local.definition.parameter))

(lambda_parameters
  (identifier) @local.definition.parameter)

(record_entry
  left: [
    (identifier)
    (integer)
  ] @local.definition.field)
