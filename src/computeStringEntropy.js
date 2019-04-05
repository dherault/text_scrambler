function computeStringEntropy(string) {
  const occurences = {}
  const l = string.length

  for (const char of string) {
    if (typeof occurences[char] === 'undefined') {
      occurences[char] = 1
    }
    else {
      occurences[char]++
    }
  }

  let h = 0

  Object.values(occurences).forEach(occurence => {
    h -= occurence / l * Math.log2(occurence / l)
  })

  return h
}

module.exports = computeStringEntropy

