((lambda) @local.scope
 (#set! local.scope-inherits false))
((function) @local.scope
 (#set! local.scope-inherits false))


(parameters
  (identifier) @local.definition)
(qualified_parameters
  (identifier) @local.definition)
(qualified_parameters
  (qualified_identifier
    (identifier) @local.definition))
(lambda_parameters
  (identifier) @local.definition)
(locals
  (identifier) @local.definition)

(identifier) @local.reference
(qualified_identifier
  (identifier) @local.reference)
