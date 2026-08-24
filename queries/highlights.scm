; Comments
(line_comment) @comment
(block_comment) @comment

((line_comment) @comment.doc
  (#match? @comment.doc "^///"))

((block_comment) @comment.doc
  (#match? @comment.doc "^/\\*\\*"))

; Declarations
(function_declaration name: (identifier) @function)
(extern_function_declaration name: (identifier) @function)
(method_signature name: (identifier) @function)
(record_declaration name: (type_identifier) @type)
(type_alias_declaration name: (type_identifier) @type)
(enum_declaration name: (type_identifier) @type)
(interface_declaration name: (type_identifier) @type)
(enum_variant name: (identifier) @constructor)
(field_declaration name: (identifier) @property)
(payload_field name: (identifier) @property)
(parameter name: (identifier) @variable.parameter)
(type_parameter name: (type_identifier) @type)
(attribute name: (identifier) @attribute)
(import_item alias: (identifier) @namespace)
(namespace_import name: (identifier) @namespace)

; Types and names
(type_identifier) @type
(nominal_type (qualified_type_identifier (type_identifier) @type))
(member_expression property: (identifier) @property)
(field_value name: (identifier) @property)
(pattern_field name: (identifier) @property)

(call_expression
  function: (primary_expression (identifier) @function))
(generic_call_expression function: (identifier) @function)
(call_expression
  function: (member_expression property: (identifier) @function))
(generic_call_expression
  function: (member_expression property: (identifier) @function))

; Literals
[
  (string_literal)
  (raw_string_literal)
  (byte_string_literal)
  (rune_literal)
  (interpolated_string)
] @string

[
  (escape_sequence)
  (byte_escape_sequence)
] @string.escape

(interpolation ["{" "}"] @punctuation.special)
(integer_literal) @number
(float_literal) @number
(boolean_literal) @boolean

; Keywords
[
  "as"
  "break"
  "const"
  "continue"
  "defer"
  "else"
  "enum"
  "extern"
  "fn"
  "for"
  "from"
  "if"
  "import"
  "in"
  "interface"
  "let"
  "match"
  "mutable"
  "public"
  "return"
  "scope"
  "spawn"
  "type"
  "unsafe"
  "while"
] @keyword

; Operators and punctuation
[
  "=" "+=" "-=" "*=" "/=" "%=" "&=" "|=" "^=" "<<=" ">>="
  "||" "&&" "&" "^" "|" "==" "!=" "<" "<=" ">" ">=" "<<" ">>"
  "+" "-" "*" "/" "%" "!" "~" "?" "=>"
] @operator

[
  "(" ")" "[" "]" "{" "}"
] @punctuation.bracket

[
  "," ";" ":" "." "@"
] @punctuation.delimiter
