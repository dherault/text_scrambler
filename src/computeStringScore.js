const characters = require('./characters')

function computeStringScore(string) {
  let score = 0

  for (const char of string) {
    score += characters.indexOf(char)
  }

  return score
}

module.exports = computeStringScore
