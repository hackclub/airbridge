export function ensureFormulaSafe(formula) {
  const protectedWords = "SUBSTITUTE LEFT RIGHT MID FIND SEARCH LEN".split(" ")
  // fail if any protected words are found in the formula
  let usedWords = []

  protectedWords.forEach((word) => {
    if (formula.toLowerCase().includes(word.toLowerCase())) {
      usedWords.push(word)
    }
  })

  if (usedWords.length > 0) {
    const err = new Error(
      `Formula contains protected words: ${usedWords.join(", ")}`
    )
    err.statusCode = 400
    throw err
  }
}
