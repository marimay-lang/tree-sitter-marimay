/**
 * @file Tree-sitter grammar for the Marimay programming language
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  ASSIGNMENT: 1,
  RANGE: 2,
  LOGICAL_OR: 3,
  LOGICAL_AND: 4,
  BITWISE: 5,
  EQUALITY: 6,
  COMPARISON: 7,
  SHIFT: 8,
  ADDITIVE: 9,
  MULTIPLICATIVE: 10,
  CONVERSION: 11,
  UNARY: 12,
  POSTFIX: 13,
  RECORD: 14,
};

const IDENTIFIER = /\p{XID_Start}\p{XID_Continue}*/u;

const RESERVED_WORDS = [
  'as',
  'break',
  'const',
  'continue',
  'defer',
  'else',
  'enum',
  'extern',
  'false',
  'fn',
  'for',
  'from',
  'if',
  'import',
  'in',
  'interface',
  'let',
  'match',
  'mutable',
  'null',
  'public',
  'return',
  'scope',
  'spawn',
  'true',
  'type',
  'undefined',
  'unsafe',
  'while',
];

module.exports = grammar({
  name: 'marimay',

  word: $ => $.identifier,

  reserved: {
    global: _ => RESERVED_WORDS,
  },

  externals: $ => [
    $.block_comment,
  ],

  extras: $ => [
    /[\s\uFEFF]/,
    $.line_comment,
    $.block_comment,
  ],

  supertypes: $ => [
    $._declaration,
    $._statement,
    $._expression,
    $._type,
    $._pattern,
  ],

  inline: $ => [
    $._top_level_item,
    $._literal,
  ],

  conflicts: $ => [
    [$.primary_expression, $._type_identifier],
    [$.generic_call_expression, $.primary_expression],
    [$._expression, $.generic_call_expression],
    [$.tuple_type],
    [$.tuple_type, $.function_type],
  ],

  rules: {
    source_file: $ => repeat($._top_level_item),

    _top_level_item: $ => choice(
      $.import_declaration,
      $.attributed_declaration,
    ),

    attributed_declaration: $ => seq(
      repeat($.attribute),
      optional('public'),
      $._declaration,
    ),

    _declaration: $ => choice(
      $.type_alias_declaration,
      $.record_declaration,
      $.enum_declaration,
      $.interface_declaration,
      $.function_declaration,
      $.extern_function_declaration,
      $.const_declaration,
    ),

    attribute: $ => seq(
      '@',
      field('name', $.identifier),
      optional(seq('(', optional($.argument_list), ')')),
    ),

    import_declaration: $ => seq(
      'import',
      field('clause', choice($.namespace_import, $.named_import)),
      'from',
      field('source', $.string_literal),
      ';',
    ),

    namespace_import: $ => seq(
      '*',
      'as',
      field('name', $.identifier),
    ),

    named_import: $ => seq(
      '{',
      optional(commaSep1($.import_item)),
      '}',
    ),

    import_item: $ => seq(
      field('name', $.identifier),
      optional(seq('as', field('alias', $.identifier))),
    ),

    type_alias_declaration: $ => seq(
      'type',
      field('name', $._type_identifier),
      optional($.type_parameters),
      '=',
      field('value', $._type),
      ';',
    ),

    record_declaration: $ => seq(
      'type',
      field('name', $._type_identifier),
      optional($.type_parameters),
      field('body', $.record_body),
    ),

    record_body: $ => seq('{', optional(commaSep1($.field_declaration)), '}'),

    field_declaration: $ => seq(
      optional('public'),
      optional('mutable'),
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    enum_declaration: $ => seq(
      'enum',
      field('name', $._type_identifier),
      optional($.type_parameters),
      '{',
      optional(commaSep1($.enum_variant)),
      '}',
    ),

    enum_variant: $ => seq(
      field('name', $.identifier),
      optional(choice($.positional_payload, $.named_payload)),
    ),

    positional_payload: $ => seq('(', commaSep1($._type), ')'),

    named_payload: $ => seq('{', optional(commaSep1($.payload_field)), '}'),

    payload_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    interface_declaration: $ => seq(
      'interface',
      field('name', $._type_identifier),
      optional($.type_parameters),
      '{',
      repeat(choice($.method_signature, $.embedded_signature)),
      '}',
    ),

    method_signature: $ => seq(
      field('name', $.identifier),
      optional($.type_parameters),
      $.parameters,
      ':',
      field('return_type', $._type),
      ';',
    ),

    embedded_signature: $ => seq(
      field('name', $.identifier),
      ';',
    ),

    function_declaration: $ => seq(
      optional('unsafe'),
      'fn',
      field('name', $.identifier),
      optional($.type_parameters),
      $.parameters,
      ':',
      field('return_type', $._type),
      field('body', $.block),
    ),

    extern_function_declaration: $ => seq(
      'extern',
      field('abi', $.string_literal),
      optional('unsafe'),
      'fn',
      field('name', $.identifier),
      optional($.type_parameters),
      $.parameters,
      ':',
      field('return_type', $._type),
      ';',
    ),

    const_declaration: $ => seq(
      'const',
      field('name', $.binding_name),
      optional(seq(':', field('type', $._type))),
      '=',
      field('value', $._expression),
      ';',
    ),

    type_parameters: $ => seq('<', commaSep1($.type_parameter), '>'),

    type_parameter: $ => seq(
      field('name', $._type_identifier),
      optional(seq(':', $.type_constraints)),
    ),

    type_constraints: $ => sep1($._type, '&'),

    parameters: $ => seq('(', optional(commaSep1($.parameter)), ')'),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    _type: $ => choice(
      $.array_type,
      $.nominal_type,
      $.tuple_type,
      $.function_type,
    ),

    array_type: $ => seq('[', ']', $._type),

    nominal_type: $ => seq(
      $.qualified_type_identifier,
      optional($.type_arguments),
    ),

    qualified_type_identifier: $ => seq(
      $._type_identifier,
      repeat(seq('.', $._type_identifier)),
    ),

    type_arguments: $ => seq('<', commaSep1($._type), '>'),

    tuple_type: $ => seq('(', $._type, ',', optional(commaSep1($._type)), ')'),

    function_type: $ => seq(
      '(',
      optional(commaSep1($._type)),
      ')',
      '=>',
      $._type,
    ),

    block: $ => seq('{', repeat($._statement), '}'),

    _statement: $ => choice(
      $.const_declaration,
      $.let_declaration,
      $.expression_statement,
      $.return_statement,
      $.defer_statement,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.scope_statement,
      $.unsafe_statement,
      $.break_statement,
      $.continue_statement,
      $.block,
    ),

    let_declaration: $ => seq(
      'let',
      field('name', $.binding_name),
      optional(seq(':', field('type', $._type))),
      optional(seq('=', field('value', $._expression))),
      ';',
    ),

    binding_name: $ => choice($.identifier, '_'),

    expression_statement: $ => seq($._expression, ';'),

    return_statement: $ => seq('return', optional($._expression), ';'),

    defer_statement: $ => seq('defer', $._expression, ';'),

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq(
        'else',
        field('alternative', choice($.if_statement, $.block)),
      )),
    )),

    while_statement: $ => seq(
      'while',
      field('condition', $._expression),
      field('body', $.block),
    ),

    for_statement: $ => seq(
      'for',
      field('header', $.for_in_header),
      field('body', $.block),
    ),

    for_in_header: $ => seq(
      field('name', $.identifier),
      'in',
      field('value', $._expression),
    ),

    scope_statement: $ => seq('scope', $.block),

    unsafe_statement: $ => seq('unsafe', $.block),

    break_statement: _ => seq('break', ';'),

    continue_statement: _ => seq('continue', ';'),

    _expression: $ => choice(
      $.assignment_expression,
      $.range_expression,
      $.binary_expression,
      $.conversion_expression,
      $.unary_expression,
      $.spawn_expression,
      $.member_expression,
      $.call_expression,
      $.generic_call_expression,
      $.index_expression,
      $.try_expression,
      $.primary_expression,
    ),

    assignment_expression: $ => prec.left(PREC.ASSIGNMENT, seq(
      field('left', choice($.identifier, $.member_expression, $.index_expression)),
      field('operator', choice(
        '=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=',
      )),
      field('right', $._expression),
    )),

    range_expression: $ => prec.left(PREC.RANGE, seq(
      field('start', $._expression),
      field('operator', choice('..', '..=')),
      field('end', $._expression),
    )),

    binary_expression: $ => choice(
      ...[
        ['||', PREC.LOGICAL_OR],
        ['&&', PREC.LOGICAL_AND],
        [choice('&', '^', '|'), PREC.BITWISE],
        [choice('==', '!='), PREC.EQUALITY],
        [choice('<', '<=', '>', '>='), PREC.COMPARISON],
        [choice('<<', '>>'), PREC.SHIFT],
        [choice('+', '-'), PREC.ADDITIVE],
        [choice('*', '/', '%'), PREC.MULTIPLICATIVE],
      ].map(([operator, precedence]) => prec.left(precedence, seq(
        field('left', $._expression),
        field('operator', operator),
        field('right', $._expression),
      ))),
    ),

    conversion_expression: $ => prec.left(PREC.CONVERSION, seq(
      field('value', $._expression),
      'as',
      field('type', $._type_identifier),
    )),

    unary_expression: $ => prec(PREC.UNARY, seq(
      field('operator', choice('!', '-', '~')),
      field('operand', $._expression),
    )),

    spawn_expression: $ => prec(PREC.UNARY, seq(
      'spawn',
      field('call', choice($.call_expression, $.generic_call_expression)),
    )),

    member_expression: $ => prec.left(PREC.POSTFIX, seq(
      field('object', $._expression),
      '.',
      field('property', $.identifier),
    )),

    call_expression: $ => prec.left(PREC.POSTFIX, seq(
      field('function', $._expression),
      field('arguments', $.arguments),
    )),

    generic_call_expression: $ => seq(
      field('function', choice($.identifier, $.member_expression)),
      field('type_arguments', $.type_arguments),
      field('arguments', $.arguments),
    ),

    arguments: $ => seq('(', optional($.argument_list), ')'),

    argument_list: $ => commaSep1($._expression),

    index_expression: $ => prec.left(PREC.POSTFIX, seq(
      field('value', $._expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    try_expression: $ => prec.left(PREC.POSTFIX, seq(
      field('value', $._expression),
      '?',
    )),

    primary_expression: $ => choice(
      $._literal,
      $.identifier,
      $.parenthesized_expression,
      $.tuple_expression,
      $.array_expression,
      $.record_expression,
      $.closure_expression,
      $.match_expression,
      $.interpolated_string,
      $.reserved_sentinel,
    ),

    _literal: $ => choice(
      $.integer_literal,
      $.float_literal,
      $.string_literal,
      $.raw_string_literal,
      $.byte_string_literal,
      $.rune_literal,
      $.boolean_literal,
    ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    tuple_expression: $ => seq('(', $._expression, ',', optional($.argument_list), ')'),

    array_expression: $ => seq('[', optional($.argument_list), ']'),

    record_expression: $ => prec(PREC.RECORD, seq(
      field('type', $.qualified_type_identifier),
      field('fields', $.record_fields),
    )),

    record_fields: $ => seq('{', optional(commaSep1($.field_value)), '}'),

    field_value: $ => seq(
      field('name', $.identifier),
      optional(seq(':', field('value', $._expression))),
    ),

    closure_expression: $ => prec.right(seq(
      field('parameters', $.parameters),
      optional(seq(':', field('return_type', $._type))),
      '=>',
      field('body', choice($._expression, $.block)),
    )),

    match_expression: $ => seq(
      'match',
      field('value', $._expression),
      '{',
      optional(commaSep1($.match_arm)),
      '}',
    ),

    match_arm: $ => seq(
      field('pattern', $._pattern),
      optional(seq('if', field('guard', $._expression))),
      '=>',
      field('body', choice($._expression, $.match_arm_block)),
    ),

    match_arm_block: $ => seq('{', repeat($._statement), optional($._expression), '}'),

    interpolated_string: $ => seq(
      '$"',
      repeat(choice($.interpolated_text, $.interpolation)),
      token.immediate('"'),
    ),

    interpolated_text: _ => token.immediate(repeat1(choice(
      /[^"\\{}\r\n]+/,
      /\\(?:[\\"'nrt0]|u\{[0-9a-fA-F]{1,6}\})/,
      '{{',
      '}}',
    ))),

    interpolation: $ => seq(
      token.immediate('{'),
      $._expression,
      '}',
    ),

    _pattern: $ => choice(
      $.or_pattern,
      $.identifier_pattern,
      $.remainder_pattern,
      $.literal_pattern,
      $.constructor_pattern,
      $.tuple_pattern,
    ),

    or_pattern: $ => prec.left(seq(
      $._pattern,
      '|',
      $._pattern,
    )),

    identifier_pattern: $ => $.identifier,

    remainder_pattern: $ => seq('_', optional(seq('as', field('name', $.identifier)))),

    literal_pattern: $ => $._literal,

    constructor_pattern: $ => seq(
      $.qualified_type_identifier,
      choice($.positional_pattern, $.named_pattern),
    ),

    positional_pattern: $ => seq('(', optional(commaSep1($._pattern)), ')'),

    named_pattern: $ => seq('{', optional(commaSep1($.pattern_field)), '}'),

    tuple_pattern: $ => seq('(', $._pattern, ',', optional(commaSep1($._pattern)), ')'),

    pattern_field: $ => seq(
      field('name', $.identifier),
      optional(seq(':', field('pattern', $._pattern))),
    ),

    integer_literal: _ => token(choice(
      /0[bB][01](?:_?[01])*/,
      /0[oO][0-7](?:_?[0-7])*/,
      /0[xX][0-9a-fA-F](?:_?[0-9a-fA-F])*/,
      /[0-9](?:_?[0-9])*/,
    )),

    float_literal: _ => token(choice(
      /[0-9](?:_?[0-9])*\.[0-9](?:_?[0-9])*(?:[eE][+-]?[0-9](?:_?[0-9])*)?/,
      /[0-9](?:_?[0-9])*[eE][+-]?[0-9](?:_?[0-9])*/,
    )),

    string_literal: $ => seq(
      '"',
      repeat(choice($.string_content, $.escape_sequence)),
      token.immediate('"'),
    ),

    string_content: _ => token.immediate(/[^"\\\r\n]+/),

    escape_sequence: _ => token.immediate(/\\(?:[\\"'nrt0]|u\{[0-9a-fA-F]{1,6}\})/),

    raw_string_literal: _ => token(/r"[^"\r\n]*"/),

    byte_string_literal: $ => seq(
      'b"',
      repeat(choice($.byte_string_content, $.byte_escape_sequence)),
      token.immediate('"'),
    ),

    byte_string_content: _ => token.immediate(/[\x20-\x21\x23-\x5b\x5d-\x7e]+/),

    byte_escape_sequence: _ => token.immediate(/\\(?:[\\"'nrt0]|x[0-9a-fA-F]{2})/),

    rune_literal: $ => seq(
      "'",
      choice($.rune_content, $.escape_sequence),
      token.immediate("'"),
    ),

    rune_content: _ => token.immediate(/[^'\\\r\n]/),

    boolean_literal: _ => choice('true', 'false'),

    // Keep the two null-like sentinels out of identifier positions while
    // retaining a stable recovery node for editor diagnostics.
    reserved_sentinel: _ => choice('null', 'undefined'),

    line_comment: _ => token(seq('//', /[^\r\n]*/)),

    identifier: _ => IDENTIFIER,

    _type_identifier: $ => alias($.identifier, $.type_identifier),
  },
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
