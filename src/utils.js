function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomArray(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function randomPop(array) {
  return array.splice(Math.floor(Math.random() * array.length), 1)[0]
}

function computeStringEntropy(string) {
  const occurences = {}
  const l = string.length

  // eslint-disable-next-line
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

function computeStringScore(string) {
  return string.split('').map((char, i) => i * char.codePointAt(0)).reduce((a, b) => a + b, 0)
}

module.exports = {
  randomRange,
  randomArray,
  randomPop,
  computeStringEntropy,
  computeStringScore,
}
