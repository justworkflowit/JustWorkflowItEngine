export default {
  "add.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "add.json",
    "title": "+",
    "description": "Addition. Because addition is associative, it happily take as many args as you want. Passing just one argument to + casts it to a number.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "+"
    ],
    "properties": {
      "+": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "+": [
          4,
          2
        ]
      },
      {
        "+": [
          2,
          2,
          2,
          2,
          2
        ]
      },
      {
        "+": "3.14"
      }
    ]
  },
  "all-operators.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "all-operators.json",
    "title": "All Operators",
    "description": "Any valid JSON Logic data source, expect primitive types.",
    "oneOf": [
      {
        "$ref": "variable.json"
      },
      {
        "$ref": "missing.json"
      },
      {
        "$ref": "missing_some.json"
      },
      {
        "$ref": "add.json"
      },
      {
        "$ref": "divide.json"
      },
      {
        "$ref": "modulo.json"
      },
      {
        "$ref": "multiply.json"
      },
      {
        "$ref": "subtract.json"
      },
      {
        "$ref": "all.json"
      },
      {
        "$ref": "filter.json"
      },
      {
        "$ref": "map.json"
      },
      {
        "$ref": "merge.json"
      },
      {
        "$ref": "none.json"
      },
      {
        "$ref": "reduce.json"
      },
      {
        "$ref": "some.json"
      },
      {
        "$ref": "and.json"
      },
      {
        "$ref": "equal.json"
      },
      {
        "$ref": "if.json"
      },
      {
        "$ref": "not.json"
      },
      {
        "$ref": "notEqual.json"
      },
      {
        "$ref": "notnot.json"
      },
      {
        "$ref": "or.json"
      },
      {
        "$ref": "strictEqual.json"
      },
      {
        "$ref": "strictNotEqual.json"
      },
      {
        "$ref": "in.json"
      },
      {
        "$ref": "log.json"
      },
      {
        "$ref": "method.json"
      },
      {
        "$ref": "greater.json"
      },
      {
        "$ref": "greaterEqual.json"
      },
      {
        "$ref": "less.json"
      },
      {
        "$ref": "lessEqual.json"
      },
      {
        "$ref": "max.json"
      },
      {
        "$ref": "min.json"
      },
      {
        "$ref": "cat.json"
      },
      {
        "$ref": "substr.json"
      }
    ]
  },
  "all-types-wo-array.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "all-types-wo-array.json",
    "title": "All",
    "description": "Any valid JSON data type, except array primitive.",
    "oneOf": [
      {
        "type": [
          "boolean",
          "null",
          "number",
          "string"
        ]
      },
      {
        "$ref": "no-logic-object.json"
      }
    ]
  },
  "all-types.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "all-types.json",
    "title": "All",
    "description": "Any valid JSON data type.",
    "oneOf": [
      {
        "type": [
          "boolean",
          "null",
          "number",
          "string",
          "array"
        ]
      },
      {
        "$ref": "no-logic-object.json"
      }
    ]
  },
  "all.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "all.json",
    "title": "all",
    "description": "These operations take an array, and perform a test on each member of that array.\nThe most interesting part of these operations is that inside the test code, var operations are relative to the array element being tested.\nIt can be useful to use {\"var\":\"\"} to get the entire array element within the test.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "all"
    ],
    "properties": {
      "all": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "all": [
          [
            1,
            2,
            3
          ],
          {
            ">": [
              {
                "var": ""
              },
              0
            ]
          }
        ]
      }
    ]
  },
  "and.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "and.json",
    "title": "and",
    "description": "and can be used for simple boolean tests, with 1 or more arguments. At a more sophisticated level, and returns the first falsy argument, or the last argument.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "and"
    ],
    "properties": {
      "and": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "and": [
          true,
          true
        ]
      },
      {
        "and": [
          true,
          false
        ]
      },
      {
        "and": [
          true,
          "a",
          3
        ]
      },
      {
        "and": [
          true,
          "",
          3
        ]
      }
    ]
  },
  "any-wo-array.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "any-wo-array.json",
    "title": "All",
    "description": "Any valid JSON Logic data source, except array primitive.",
    "oneOf": [
      {
        "$ref": "all-operators.json"
      },
      {
        "$ref": "all-types-wo-array.json"
      }
    ]
  },
  "any.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "any.json",
    "title": "JSONLogicSchema",
    "description": "Any valid JSON Logic data source.",
    "oneOf": [
      {
        "$ref": "all-operators.json"
      },
      {
        "$ref": "all-types.json"
      }
    ]
  },
  "binary-args.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "binary-args.json",
    "title": "Binary Arg",
    "description": "Up to two args of valid JSON Logic data source.",
    "oneOf": [
      {
        "title": "Array",
        "description": "An array with one or two elements.",
        "type": "array",
        "minItems": 1,
        "maxItems": 2,
        "items": {
          "$ref": "any.json"
        }
      },
      {
        "$ref": "any-wo-array.json",
        "title": "Single Arg",
        "description": "Note: binary operators can also take a single, non array argument:"
      }
    ]
  },
  "cat.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "cat.json",
    "title": "cat",
    "description": "Concatenate all the supplied arguments. Note that this is not a join or implode operation, there is no “glue” string.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "cat"
    ],
    "properties": {
      "cat": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "cat": [
          "I love",
          " pie"
        ]
      },
      {
        "cat": [
          "I love ",
          {
            "var": "filling"
          },
          " pie"
        ]
      }
    ]
  },
  "divide.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "divide.json",
    "title": "/",
    "description": "Division.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "/"
    ],
    "properties": {
      "/": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "/": [
          4,
          2
        ]
      }
    ]
  },
  "equal.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "equal.json",
    "title": "Equal",
    "description": "Tests equality, with type coercion. Requires two arguments.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "=="
    ],
    "properties": {
      "==": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "==": [
          1,
          1
        ]
      },
      {
        "==": [
          1,
          "1"
        ]
      },
      {
        "==": [
          0,
          false
        ]
      }
    ]
  },
  "filter.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "filter.json",
    "title": "filter",
    "description": "You can use filter to keep only elements of the array that pass a test. Note, that inside the logic being used to map, var operations are relative to the array element being worked on.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "filter"
    ],
    "properties": {
      "filter": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "filter": [
          {
            "var": "integers"
          },
          {
            "%": [
              {
                "var": ""
              },
              2
            ]
          }
        ]
      }
    ]
  },
  "greater.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "greater.json",
    "title": ">",
    "description": "Greater than.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      ">"
    ],
    "properties": {
      ">": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        ">": [
          2,
          1
        ]
      }
    ]
  },
  "greaterEqual.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "greaterEqual.json",
    "title": ">=",
    "description": "Greater than or equal to.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      ">="
    ],
    "properties": {
      ">=": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        ">=": [
          1,
          1
        ]
      }
    ]
  },
  "if.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "if.json",
    "title": "if",
    "description": "The if statement typically takes 3 arguments: a condition (if), what to do if it’s true (then), and what to do if it’s false (else), like: {\"if\" : [ true, \"yes\", \"no\" ]}.\nIf can also take more than 3 arguments, and will pair up arguments like if/then elseif/then elseif/then else.",
    "oneOf": [
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "if"
        ],
        "properties": {
          "if": {
            "$ref": "one-or-more-args.json"
          }
        }
      },
      {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "?:"
        ],
        "properties": {
          "?:": {
            "$ref": "one-or-more-args.json"
          }
        }
      }
    ],
    "examples": [
      {
        "if": [
          true,
          "yes",
          "no"
        ]
      },
      {
        "if": [
          false,
          "yes",
          "no"
        ]
      },
      {
        "if": [
          {
            "<": [
              {
                "var": "temp"
              },
              0
            ]
          },
          "freezing",
          {
            "<": [
              {
                "var": "temp"
              },
              100
            ]
          },
          "liquid",
          "gas"
        ]
      }
    ]
  },
  "in.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "in.json",
    "title": "in",
    "description": "If the second argument is an array, tests that the first argument is a member of the array: {\"in\":[ \"Ringo\", [\"John\", \"Paul\", \"George\", \"Ringo\"] ]}.\nIf the second argument is a string, tests that the first argument is a substring: {\"in\":[\"Spring\", \"Springfield\"]}.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "in"
    ],
    "properties": {
      "in": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "in": [
          "Spring",
          "Springfield"
        ]
      }
    ]
  },
  "json-logic.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "json-logic.json",
    "title": "JSON-Logic Schema",
    "description": "Build complex rules, serialize them as JSON, share them between front-end and back-end.",
    "$ref": "any.json"
  },
  "less.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "less.json",
    "title": "<",
    "description": "Less than. You can use a special case of < to test that one value is exclusively between two others.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "<"
    ],
    "properties": {
      "<": {
        "$ref": "trinary-args.json"
      }
    },
    "examples": [
      {
        "<": [
          1,
          2
        ]
      },
      {
        "<": [
          1,
          2,
          3
        ]
      },
      {
        "<": [
          0,
          {
            "var": "temp"
          },
          100
        ]
      }
    ]
  },
  "lessEqual.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "lessEqual.json",
    "title": "<=",
    "description": "Less than or equal to. You can use a special case of <= to test that one value is inclusively between two others.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "<="
    ],
    "properties": {
      "<=": {
        "$ref": "trinary-args.json"
      }
    },
    "examples": [
      {
        "<=": [
          1,
          1
        ]
      },
      {
        "<=": [
          1,
          2,
          3
        ]
      },
      {
        "<=": [
          0,
          {
            "var": "temp"
          },
          100
        ]
      }
    ]
  },
  "log.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "log.json",
    "title": "log",
    "description": "Logs the first value to console, then passes it through unmodified.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "log"
    ],
    "properties": {
      "log": {
        "$ref": "any.json"
      }
    },
    "examples": [
      {
        "log": "apple"
      }
    ]
  },
  "map.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "map.json",
    "title": "map",
    "description": "You can use map to perform an action on every member of an array. Note, that inside the logic being used to map, var operations are relative to the array element being worked on.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "map"
    ],
    "properties": {
      "map": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "map": [
          {
            "var": "integers"
          },
          {
            "*": [
              {
                "var": ""
              },
              2
            ]
          }
        ]
      }
    ]
  },
  "max.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "max.json",
    "title": "max",
    "description": "Return the maximum from a list of values.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "max"
    ],
    "properties": {
      "max": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "max": [
          1,
          2,
          3
        ]
      }
    ]
  },
  "merge.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "merge.json",
    "title": "merge",
    "description": "Takes one or more arrays, and merges them into one array. If arguments aren’t arrays, they get cast to arrays.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "merge"
    ],
    "properties": {
      "merge": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "merge": [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ]
      },
      {
        "merge": [
          1,
          2,
          [
            3,
            4
          ]
        ]
      }
    ]
  },
  "method.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "method.json",
    "title": "method",
    "description": "If your rule needs to call a method on an object, you can use the built-in method operation.\n You can also pass an array of arguments into the method.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "method"
    ],
    "properties": {
      "method": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "method": [
          {
            "var": "today"
          },
          "getDay"
        ]
      },
      {
        "method": [
          "automaton",
          "slice",
          [
            2,
            8
          ]
        ]
      }
    ]
  },
  "min.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "min.json",
    "title": "min",
    "description": "Return the minimum from a list of values.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "min"
    ],
    "properties": {
      "min": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "min": [
          1,
          2,
          3
        ]
      }
    ]
  },
  "missing.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "missing.json",
    "title": "missing",
    "description": "Takes an array of data keys to search for (same format as var). Returns an array of any keys that are missing from the data object, or an empty array.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "missing"
    ],
    "properties": {
      "missing": {
        "$ref": "var.json"
      }
    },
    "examples": [
      {
        "missing": [
          "a",
          "b"
        ]
      },
      {
        "if": [
          {
            "missing": [
              "a",
              "b"
            ]
          },
          "'a' and/or 'b' are missing",
          "OK to proceed"
        ]
      }
    ]
  },
  "missing_some.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "missing_some.json",
    "title": "missing_some",
    "description": "Takes a minimum number of data keys that are required, and an array of keys to search for (same format as var or missing). Returns an empty array if the minimum is met, or an array of the missing keys otherwise.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "missing_some"
    ],
    "properties": {
      "missing_some": {
        "type": "array",
        "minItems": 2,
        "maxItems": 2,
        "items": [
          {
            "type": "integer",
            "title": "Need-Count",
            "description": "Takes a minimum number of data keys that are required"
          },
          {
            "$ref": "var.json",
            "description": "An array of keys to search for (same format as var or missing)."
          }
        ]
      }
    },
    "examples": [
      {
        "missing_some": [
          1,
          [
            "a",
            "b",
            "c"
          ]
        ]
      },
      {
        "missing_some": [
          2,
          [
            "a",
            "b",
            "c"
          ]
        ]
      }
    ]
  },
  "modulo.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "modulo.json",
    "title": "%",
    "description": "Module. Finds the remainder after the first argument is divided by the second argument.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "%"
    ],
    "properties": {
      "%": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "%": [
          101,
          2
        ]
      }
    ]
  },
  "multiply.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "multiply.json",
    "title": "*",
    "description": "Multiplication. Because multiplication is associative, it happily take as many args as you want.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "*"
    ],
    "properties": {
      "*": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "*": [
          4,
          2
        ]
      },
      {
        "*": [
          2,
          2,
          2,
          2,
          2
        ]
      }
    ]
  },
  "no-logic-object.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "no-logic-object.json",
    "title": "No-Logic",
    "description": "Any valid JSON object which is not a logic rule.",
    "oneOf": [
      {
        "title": "Empty object.",
        "type": "object",
        "maxProperties": 0
      },
      {
        "title": "Non-Logic single key object.",
        "allOf": [
          {
            "type": "object",
            "minProperties": 1,
            "maxProperties": 1
          },
          {
            "not": {
              "type": "object",
              "minProperties": 1,
              "maxProperties": 1,
              "oneOf": [
                {
                  "required": [
                    "var"
                  ]
                },
                {
                  "required": [
                    "missing"
                  ]
                },
                {
                  "required": [
                    "missing_some"
                  ]
                },
                {
                  "required": [
                    "+"
                  ]
                },
                {
                  "required": [
                    "/"
                  ]
                },
                {
                  "required": [
                    "%"
                  ]
                },
                {
                  "required": [
                    "*"
                  ]
                },
                {
                  "required": [
                    "-"
                  ]
                },
                {
                  "required": [
                    "all"
                  ]
                },
                {
                  "required": [
                    "filter"
                  ]
                },
                {
                  "required": [
                    "map"
                  ]
                },
                {
                  "required": [
                    "merge"
                  ]
                },
                {
                  "required": [
                    "none"
                  ]
                },
                {
                  "required": [
                    "reduce"
                  ]
                },
                {
                  "required": [
                    "some"
                  ]
                },
                {
                  "required": [
                    "and"
                  ]
                },
                {
                  "required": [
                    "=="
                  ]
                },
                {
                  "required": [
                    "if"
                  ]
                },
                {
                  "required": [
                    "?:"
                  ]
                },
                {
                  "required": [
                    "!"
                  ]
                },
                {
                  "required": [
                    "!="
                  ]
                },
                {
                  "required": [
                    "!!"
                  ]
                },
                {
                  "required": [
                    "or"
                  ]
                },
                {
                  "required": [
                    "==="
                  ]
                },
                {
                  "required": [
                    "!=="
                  ]
                },
                {
                  "required": [
                    "in"
                  ]
                },
                {
                  "required": [
                    "log"
                  ]
                },
                {
                  "required": [
                    "method"
                  ]
                },
                {
                  "required": [
                    ">"
                  ]
                },
                {
                  "required": [
                    ">="
                  ]
                },
                {
                  "required": [
                    "<"
                  ]
                },
                {
                  "required": [
                    "<="
                  ]
                },
                {
                  "required": [
                    "max"
                  ]
                },
                {
                  "required": [
                    "min"
                  ]
                },
                {
                  "required": [
                    "cat"
                  ]
                },
                {
                  "required": [
                    "substr"
                  ]
                }
              ]
            }
          }
        ]
      },
      {
        "title": "Non-Logic multiple key object.",
        "type": "object",
        "minProperties": 2
      }
    ]
  },
  "none.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "none.json",
    "title": "none",
    "description": "These operations take an array, and perform a test on each member of that array.\nThe most interesting part of these operations is that inside the test code, var operations are relative to the array element being tested.\nIt can be useful to use {\"var\":\"\"} to get the entire array element within the test.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "none"
    ],
    "properties": {
      "none": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "none": [
          [
            -3,
            -2,
            -1
          ],
          {
            ">": [
              {
                "var": ""
              },
              0
            ]
          }
        ]
      }
    ]
  },
  "not.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "not.json",
    "title": "!",
    "description": "Logical negation (“not”). Takes just one argument.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "!"
    ],
    "properties": {
      "!": {
        "$ref": "unary-arg.json"
      }
    },
    "examples": [
      {
        "!": [
          true
        ]
      },
      {
        "!": true
      }
    ]
  },
  "notEqual.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "notEqual.json",
    "title": "Not-Equal",
    "description": "Tests not-equal, with type coercion. Requires two arguments.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "!="
    ],
    "properties": {
      "!=": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "!=": [
          1,
          2
        ]
      },
      {
        "!=": [
          1,
          "1"
        ]
      }
    ]
  },
  "notnot.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "notnot.json",
    "title": "!!",
    "description": "Double negation, or “cast to a boolean.” Takes a single argument.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "!!"
    ],
    "properties": {
      "!!": {
        "$ref": "unary-arg.json"
      }
    },
    "examples": [
      {
        "!!": [
          []
        ]
      },
      {
        "!!": [
          "0"
        ]
      }
    ]
  },
  "one-or-more-args.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "one-or-more-args.json",
    "title": "1 or more args",
    "description": "With 1 or more arguments.",
    "oneOf": [
      {
        "title": "Single Array",
        "description": "An array with 1 or more elements.",
        "type": "array",
        "items": {
          "$ref": "any.json"
        }
      },
      {
        "$ref": "any-wo-array.json",
        "title": "Single Arg",
        "description": "Note: 1 or more operators can also take a single, non array argument:"
      }
    ]
  },
  "or.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "or.json",
    "title": "or",
    "description": "or can be used for simple boolean tests, with 1 or more arguments. At a more sophisticated level, or returns the first truthy argument, or the last argument.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "or"
    ],
    "properties": {
      "or": {
        "$ref": "one-or-more-args.json"
      }
    },
    "examples": [
      {
        "or": [
          true,
          false
        ]
      },
      {
        "or": [
          false,
          true
        ]
      },
      {
        "or": [
          false,
          "a"
        ]
      },
      {
        "or": [
          false,
          0,
          "a"
        ]
      }
    ]
  },
  "pointer.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "pointer.json",
    "title": "Pointer",
    "description": "Schema to access properties of an object or items of an array by index.",
    "oneOf": [
      {
        "type": "string",
        "title": "Property",
        "description": "The key passed to var can use dot-notation to get the property of a property (to any depth you need):",
        "minLength": 1
      },
      {
        "type": "integer",
        "title": "Index",
        "description": "You can also use the var operator to access an array by numeric index.",
        "minimum": 0
      }
    ]
  },
  "reduce.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "reduce.json",
    "title": "reduce",
    "description": "You can use reduce to combine all the elements in an array into a single value, like adding up a list of numbers. Note, that inside the logic being used to reduce, var operations only have access to an object like: {\n  \"current\" : // this element of the array,\n  \"accumulator\" : // progress so far, or the initial value\n}",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "reduce"
    ],
    "properties": {
      "reduce": {
        "$ref": "trinary-args.json"
      }
    },
    "examples": [
      {
        "reduce": [
          {
            "var": "integers"
          },
          {
            "+": [
              {
                "var": "current"
              },
              {
                "var": "accumulator"
              }
            ]
          },
          0
        ]
      }
    ]
  },
  "some.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "some.json",
    "title": "some",
    "description": "These operations take an array, and perform a test on each member of that array.\nThe most interesting part of these operations is that inside the test code, var operations are relative to the array element being tested.\nIt can be useful to use {\"var\":\"\"} to get the entire array element within the test.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "some"
    ],
    "properties": {
      "some": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "some": [
          [
            -1,
            0,
            1
          ],
          {
            ">": [
              {
                "var": ""
              },
              0
            ]
          }
        ]
      },
      {
        "some": [
          {
            "var": "pies"
          },
          {
            "==": [
              {
                "var": "filling"
              },
              "apple"
            ]
          }
        ]
      }
    ]
  },
  "strictEqual.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "strictEqual.json",
    "title": "Strict Equal",
    "description": "Tests strict equality. Requires two arguments.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "==="
    ],
    "properties": {
      "===": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "===": [
          1,
          1
        ]
      },
      {
        "===": [
          1,
          "1"
        ]
      }
    ]
  },
  "strictNotEqual.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "strictNotEqual.json",
    "title": "Strict Not-Equal",
    "description": "Tests strict not-equal. Requires two arguments.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "!=="
    ],
    "properties": {
      "!==": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "!==": [
          1,
          2
        ]
      },
      {
        "!==": [
          1,
          "1"
        ]
      }
    ]
  },
  "substr.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "substr.json",
    "title": "substr",
    "description": "Get a portion of a string.\n\nGive a positive start position to return everything beginning at that index (Indexes of course start at zero).\nGive a negative start position to work backwards from the end of the string, then return everything.\nGive a positive length to express how many characters to return.\nGive a negative length to stop that many characters before the end.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "substr"
    ],
    "properties": {
      "substr": {
        "$ref": "trinary-args.json"
      }
    },
    "examples": [
      {
        "substr": [
          "jsonlogic",
          4
        ]
      },
      {
        "substr": [
          "jsonlogic",
          -5
        ]
      },
      {
        "substr": [
          "jsonlogic",
          1,
          3
        ]
      },
      {
        "substr": [
          "jsonlogic",
          4,
          -2
        ]
      }
    ]
  },
  "subtract.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "subtract.json",
    "title": "-",
    "description": "Subtraction. Passing just one argument to - returns its arithmetic negative (additive inverse).",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "-"
    ],
    "properties": {
      "-": {
        "$ref": "binary-args.json"
      }
    },
    "examples": [
      {
        "-": [
          4,
          2
        ]
      },
      {
        "-": 2
      },
      {
        "-": -2
      }
    ]
  },
  "trinary-args.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "trinary-args.json",
    "title": "Trinary Args",
    "description": "Up to three args of valid JSON Logic data source.",
    "oneOf": [
      {
        "title": "Array",
        "description": "An array with one or three elements.",
        "type": "array",
        "minItems": 1,
        "maxItems": 3,
        "items": {
          "$ref": "any.json"
        }
      },
      {
        "$ref": "any-wo-array.json",
        "title": "Single Arg",
        "description": "Note: trinary operators can also take a single, non array argument:"
      }
    ]
  },
  "unary-arg.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "unary-arg.json",
    "title": "Unary Arg",
    "description": "Only one valid JSON Logic data source.",
    "oneOf": [
      {
        "title": "Single Array",
        "description": "An array with just one element.",
        "type": "array",
        "minItems": 1,
        "maxItems": 1,
        "items": {
          "$ref": "any.json"
        }
      },
      {
        "$ref": "any-wo-array.json",
        "title": "Single Arg",
        "description": "Note: unary operators can also take a single, non array argument:"
      }
    ]
  },
  "var.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "var.json",
    "title": "Var",
    "description": "Retrieve data from the provided data object.",
    "oneOf": [
      {
        "type": "array",
        "items": [
          {
            "oneOf": [
              {
                "$ref": "pointer.json"
              },
              {
                "$ref": "if.json"
              }
            ]
          },
          {
            "$ref": "all-types.json",
            "title": "Default",
            "description": "You can supply a default, as the second argument, for values that might be missing in the data object."
          }
        ]
      },
      {
        "$ref": "map.json"
      },
      {
        "$ref": "merge.json"
      },
      {
        "$ref": "filter.json"
      },
      {
        "$ref": "reduce.json"
      },
      {
        "$ref": "pointer.json",
        "title": "Shortcut",
        "description": "If you like, we support syntactic sugar to skip the array around single arguments."
      },
      {
        "type": "string",
        "const": "",
        "title": "Entire data object",
        "description": "You can also use var with an empty string to get the entire data object – which is really useful in map, filter, and reduce rules."
      },
      {
        "type": "null",
        "title": "Null",
        "description": "Unknown null."
      }
    ]
  },
  "variable.json": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "variable.json",
    "title": "var",
    "description": "Retrieve data from the provided data object.",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "var"
    ],
    "properties": {
      "var": {
        "$ref": "var.json"
      }
    },
    "examples": [
      {
        "var": [
          "a"
        ]
      },
      {
        "var": [
          "z",
          26
        ]
      },
      {
        "var": "champ.name"
      },
      {
        "var": 1
      },
      {
        "var": ""
      }
    ]
  },
  "JustWorkflowItWorkflowDefinition": {
    "$id": "JustWorkflowItWorkflowDefinition",
    "title": "JustWorkflowIt Workflow Definition",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "workflowName": {
        "type": "string"
      },
      "steps": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/stepDefinition"
        }
      },
      "definitions": {
        "$ref": "#/definitions/definitionsSchema"
      }
    },
    "definitions": {
      "definitionsSchema": {
        "anyOf": [
          {
            "type": "object",
            "properties": {
              "workflowInput": {
                "$ref": "#/definitions/definitionSchema"
              }
            },
            "additionalProperties": {
              "$ref": "#/definitions/definitionSchema"
            },
            "required": [
              "workflowInput"
            ]
          },
          {
            "type": "object",
            "additionalProperties": {
              "$ref": "#/definitions/definitionSchema"
            }
          }
        ]
      },
      "definitionSchema": {
        "type": "object",
        "properties": {
          "$ref": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "enum": {
            "type": "array"
          },
          "properties": {
            "type": "object",
            "additionalProperties": {
              "$ref": "#/definitions/definitionSchema"
            }
          },
          "items": {
            "$ref": "#/definitions/definitionSchema"
          },
          "required": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "additionalProperties": {
            "type": "boolean"
          }
        },
        "anyOf": [
          {
            "required": [
              "$ref"
            ]
          },
          {
            "required": [
              "type"
            ]
          }
        ],
        "additionalProperties": false
      },
      "stepDefinition": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "retries": {
            "type": "integer"
          },
          "timeoutSeconds": {
            "type": "integer"
          },
          "transitionToStep": {
            "oneOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              },
              {
                "type": "object",
                "properties": {
                  "if": {
                    "type": "array",
                    "minItems": 3,
                    "items": {
                      "$ref": "any.json"
                    }
                  }
                },
                "required": [
                  "if"
                ],
                "additionalProperties": false
              }
            ]
          },
          "integrationDetails": {
            "$ref": "#/definitions/integrationDetails"
          }
        },
        "required": [
          "name",
          "integrationDetails"
        ],
        "additionalProperties": false
      },
      "integrationDetails": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string"
          },
          "inputTransformer": {
            "$ref": "#/definitions/jsonXformSchema"
          },
          "inputDefinition": {
            "$ref": "#/definitions/refSchema"
          },
          "outputDefinition": {
            "$ref": "#/definitions/refSchema"
          },
          "config": {
            "type": "object",
            "description": "Static configuration for the step executor, validated against the executor's configDefinition.",
            "additionalProperties": true
          }
        },
        "required": [
          "type",
          "inputDefinition",
          "outputDefinition"
        ],
        "additionalProperties": false
      },
      "refSchema": {
        "type": "object",
        "properties": {
          "$ref": {
            "type": "string"
          }
        },
        "required": [
          "$ref"
        ],
        "additionalProperties": false
      },
      "jsonXformSchema": {
        "title": "JSON-xform Schema",
        "type": "object",
        "description": "https://github.com/perpk/json-xform",
        "properties": {
          "fieldset": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/fieldsetSchema"
            }
          }
        },
        "required": [
          "fieldset"
        ],
        "additionalProperties": false
      },
      "fieldsetSchema": {
        "type": "object",
        "properties": {
          "from": {
            "type": "string"
          },
          "to": {
            "type": "string"
          },
          "valueToKey": {
            "type": "boolean"
          },
          "withValueFrom": {
            "type": "string"
          },
          "withTemplate": {
            "type": "string"
          },
          "toArray": {
            "type": "boolean"
          },
          "via": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": [
                  "date",
                  "commands"
                ]
              },
              "sourceFormat": {
                "type": "string"
              },
              "format": {
                "type": "string"
              }
            },
            "required": [
              "type"
            ],
            "additionalProperties": false
          },
          "fromEach": {
            "type": "object",
            "properties": {
              "field": {
                "type": "string"
              },
              "to": {
                "type": "string"
              },
              "flatten": {
                "type": "boolean"
              },
              "fieldset": {
                "type": "array",
                "items": {
                  "$ref": "#/definitions/fieldsetSchema"
                }
              }
            },
            "required": [
              "field"
            ],
            "additionalProperties": false
          }
        },
        "required": [],
        "additionalProperties": false
      }
    },
    "required": [
      "workflowName",
      "steps",
      "definitions"
    ],
    "additionalProperties": false
  }
};