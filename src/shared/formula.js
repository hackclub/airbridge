function badRequest(message) {
  const error = new Error("Invalid filterByFormula: " + message)
  error.statusCode = 400

  return error
}

const ALLOWED_FUNCTIONS = new Set([
  "AND",
  "OR",
  "NOT",
  "XOR",
  "IF",
  "TRUE",
  "FALSE",
  "BLANK",
  "RECORD_ID",
  "VALUE",
  "ABS",
  "ROUND",
])

function buildFieldMap(allowedFields) {
  const lookup = new Map()

  if (!allowedFields) return lookup

  const names =
    allowedFields instanceof Map ? allowedFields.values() : allowedFields

  for (const name of names) {
    if (typeof name === "string") lookup.set(name.toLowerCase(), name)
  }

  return lookup
}

function tokenize(formula) {
  if (typeof formula !== "string") throw badRequest("must be a string")
  if (formula.length > 4000) throw badRequest("too long")

  const isDigit = (char) => char >= "0" && char <= "9"

  const isNameStart = (char) =>
    (char >= "A" && char <= "Z") || (char >= "a" && char <= "z") || char === "_"

  const isNamePart = (char) => isNameStart(char) || isDigit(char)

  const tokens = []
  const length = formula.length
  let position = 0

  while (position < length) {
    const char = formula[position]

    if (char === " " || char === "\t" || char === "\n" || char === "\r") {
      position++
      continue
    }

    if (char === "'" || char === '"') {
      const quote = char
      let scan = position + 1
      let value = ""
      let terminated = false

      while (scan < length) {
        const inner = formula[scan]

        if (inner === "\\") {
          if (scan + 1 >= length) break
          value += formula[scan + 1]
          scan += 2
          continue
        }

        if (inner === quote) {
          terminated = true
          scan++
          break
        }

        value += inner
        scan++
      }

      if (!terminated) throw badRequest("unterminated string")

      if (/[\\"]/.test(value)) {
        throw badRequest("string may not contain a backslash or double-quote")
      }

      tokens.push({ type: "string", value })
      position = scan
      continue
    }

    if (char === "{") {
      let scan = position + 1
      let name = ""
      let terminated = false

      while (scan < length) {
        const inner = formula[scan]

        if (inner === "}") {
          terminated = true
          scan++
          break
        }

        if (inner === "{") throw badRequest("nested '{' in field reference")

        name += inner
        scan++
      }

      if (!terminated) throw badRequest("unterminated field reference")

      tokens.push({ type: "field", name })
      position = scan
      continue
    }

    if (isDigit(char)) {
      let scan = position
      let value = ""

      while (scan < length && isDigit(formula[scan])) value += formula[scan++]

      if (formula[scan] === ".") {
        value += formula[scan++]
        while (scan < length && isDigit(formula[scan])) value += formula[scan++]
      }

      tokens.push({ type: "number", value })
      position = scan
      continue
    }

    if (isNameStart(char)) {
      let scan = position
      let value = ""

      while (scan < length && isNamePart(formula[scan]))
        value += formula[scan++]

      tokens.push({ type: "ident", value })
      position = scan
      continue
    }

    const twoChar = formula.substr(position, 2)

    if (
      twoChar === "!=" ||
      twoChar === "<>" ||
      twoChar === "<=" ||
      twoChar === ">="
    ) {
      tokens.push({ type: "op", value: twoChar === "<>" ? "!=" : twoChar })
      position += 2
      continue
    }

    if ("=<>+-*/&(),".indexOf(char) > -1) {
      tokens.push({ type: "op", value: char })
      position++
      continue
    }

    throw badRequest("unexpected character " + JSON.stringify(char))
  }

  return tokens
}

function parse(tokens, allowedFieldMap) {
  const COMPARISON_OPERATORS = ["=", "!=", "<", ">", "<=", ">="]

  let index = 0
  let nestingDepth = 0

  const peek = () => tokens[index]
  const consume = () => tokens[index++]
  const atOperator = (value) =>
    peek() && peek().type === "op" && peek().value === value

  function resolveField(rawName) {
    const canonicalName = allowedFieldMap.get(String(rawName).toLowerCase())

    if (!canonicalName) {
      throw badRequest(
        "references non-permitted field " + JSON.stringify(rawName)
      )
    }

    if (/[{}]/.test(canonicalName)) {
      throw badRequest("field name is not safely serializable")
    }

    return { kind: "field", name: canonicalName }
  }

  function parseExpression() {
    return parseComparison()
  }

  function parseComparison() {
    let left = parseConcatenation()

    while (
      peek() &&
      peek().type === "op" &&
      COMPARISON_OPERATORS.indexOf(peek().value) > -1
    ) {
      const operator = consume().value
      left = { kind: "binary", operator, left, right: parseConcatenation() }
    }

    return left
  }

  function parseConcatenation() {
    let left = parseAddition()

    while (atOperator("&")) {
      consume()
      left = { kind: "binary", operator: "&", left, right: parseAddition() }
    }

    return left
  }

  function parseAddition() {
    let left = parseMultiplication()

    while (atOperator("+") || atOperator("-")) {
      const operator = consume().value
      left = { kind: "binary", operator, left, right: parseMultiplication() }
    }

    return left
  }

  function parseMultiplication() {
    let left = parseUnary()

    while (atOperator("*") || atOperator("/")) {
      const operator = consume().value
      left = { kind: "binary", operator, left, right: parseUnary() }
    }

    return left
  }

  function parseUnary() {
    if (atOperator("-")) {
      consume()
      return { kind: "unary", operator: "-", operand: parseUnary() }
    }

    return parsePrimary()
  }

  function parsePrimary() {
    if (++nestingDepth > 120) throw badRequest("nested too deeply")

    try {
      const token = peek()

      if (!token) throw badRequest("unexpected end of formula")

      if (token.type === "number") {
        consume()
        return { kind: "number", value: token.value }
      }

      if (token.type === "string") {
        consume()
        return { kind: "string", value: token.value }
      }

      if (token.type === "field") {
        consume()
        return resolveField(token.name)
      }

      if (token.type === "op" && token.value === "(") {
        consume()
        const grouped = parseExpression()

        if (!atOperator(")")) throw badRequest("expected ')'")

        consume()
        return grouped
      }

      if (token.type === "ident") {
        consume()

        if (atOperator("(")) {
          const functionName = token.value.toUpperCase()

          if (!ALLOWED_FUNCTIONS.has(functionName)) {
            throw badRequest("function not permitted: " + token.value)
          }

          consume()
          const args = []

          if (!atOperator(")")) {
            args.push(parseExpression())

            while (atOperator(",")) {
              consume()
              args.push(parseExpression())
            }
          }

          if (!atOperator(")"))
            throw badRequest("expected ')' to close " + token.value)

          consume()
          return { kind: "call", name: functionName, args }
        }

        return resolveField(token.value)
      }

      throw badRequest("unexpected token")
    } finally {
      nestingDepth--
    }
  }

  const tree = parseExpression()

  if (index !== tokens.length) throw badRequest("unexpected trailing input")

  return tree
}

function serialize(node) {
  switch (node.kind) {
    case "number":
      return node.value

    case "string":
      return '"' + node.value + '"'

    case "field":
      return "{" + node.name + "}"

    case "unary":
      return "(" + node.operator + serialize(node.operand) + ")"

    case "binary":
      return (
        "(" + serialize(node.left) + node.operator + serialize(node.right) + ")"
      )

    case "call":
      return node.name + "(" + node.args.map(serialize).join(",") + ")"

    default:
      throw badRequest("internal: cannot serialize node")
  }
}

export function sanitizeFormula(formula, allowedFields) {
  return serialize(parse(tokenize(formula), buildFieldMap(allowedFields)))
}

export function sanitizeSelect(rawSelect, allowedFields) {
  const allowedFieldMap = buildFieldMap(allowedFields)
  const source = rawSelect && typeof rawSelect === "object" ? rawSelect : {}
  const safeSelect = {}

  if (source.filterByFormula != null) {
    if (typeof source.filterByFormula !== "string") {
      throw badRequest("filterByFormula must be a string")
    }

    const formula = source.filterByFormula.trim()

    if (formula) {
      safeSelect.filterByFormula = serialize(
        parse(tokenize(formula), allowedFieldMap)
      )
    }
  }

  if (source.sort != null) {
    if (!Array.isArray(source.sort)) throw badRequest("sort must be an array")

    safeSelect.sort = source.sort.map((entry) => {
      if (!entry || typeof entry !== "object")
        throw badRequest("invalid sort entry")

      const canonicalName = allowedFieldMap.get(
        String(entry.field).toLowerCase()
      )

      if (!canonicalName) {
        throw badRequest(
          "sort references non-permitted field " +
            JSON.stringify(entry && entry.field)
        )
      }

      return {
        field: canonicalName,
        direction: entry.direction === "desc" ? "desc" : "asc",
      }
    })
  }

  if (source.fields != null) {
    if (!Array.isArray(source.fields))
      throw badRequest("fields must be an array")

    safeSelect.fields = source.fields
      .map((name) => allowedFieldMap.get(String(name).toLowerCase()))
      .filter(Boolean)
  }

  if (source.maxRecords != null) {
    const maxRecords = Number(source.maxRecords)
    if (Number.isFinite(maxRecords) && maxRecords > 0)
      safeSelect.maxRecords = Math.floor(maxRecords)
  }

  if (source.pageSize != null) {
    const pageSize = Number(source.pageSize)
    if (Number.isFinite(pageSize) && pageSize > 0)
      safeSelect.pageSize = Math.min(Math.floor(pageSize), 100)
  }

  if (source.cellFormat === "string") {
    safeSelect.cellFormat = "string"
    if (source.timeZone) safeSelect.timeZone = String(source.timeZone)
    if (source.userLocale) safeSelect.userLocale = String(source.userLocale)
  }

  return safeSelect
}
