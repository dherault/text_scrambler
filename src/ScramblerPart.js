const { randomRange } = require('./utils')

class CharactersAdderScramblerPart {

  printCommonCode() {
    return `\
    const score = dependencies.computeStringScore(password).toString()
    const step = Math.floor((parseInt(score.charAt(0)) + parseInt(score.charAt(score.length - 1))) / 2)
    `
  }

  toEncoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      ${this.printCommonCode()}
      for (let i = 0; i < string.length; i += step) {
        string = string.slice(0, i) + String.fromCodePoint(dependencies.randomRange(0, 65535)) + string.slice(i)
      }

      return string
    }
    `
  }

  toDecoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      ${this.printCommonCode()}
      for (let i = 0; i < string.length; i += step - 1) {
        string = string.slice(0, i) + string.slice(i + 1)
      }

      return string
    }
    `
  }
}

class CharacterSwapperScramblerPart {
  constructor() {
    this.tuples = []
    this.offset1 = randomRange(1, 10)
    this.offset2 = randomRange(1, 10)

    for (let i = 0; i < 100; i++) {
      this.tuples.push([
        Math.random(),
        Math.random(),
      ])
    }
  }

  printCommonCode() {
    return `\
    const masterTuples = ${JSON.stringify(this.tuples)}.map(tuple => tuple.map(d => Math.floor(string.length * d)))
    const passwordIndexes = password.split('').map(char => char.codePointAt(0))
    const minPasswordIndex = Math.min(...passwordIndexes)
    const tuplesIndexes = [...(new Set(passwordIndexes.map(index => index - minPasswordIndex)))]
    const tuples = tuplesIndexes.map(index => masterTuples[index]).filter(tuple => tuple)
    const finalTuples = [...tuples]
    const array = string.split('')

    for (let i = 0; i < string.length; i++) {
      finalTuples.push(...tuples.map(([i1, i2]) => [
        Math.min(string.length - 1, i1 + i + ${this.offset1}),
        Math.min(string.length - 1, i2 + i + ${this.offset2}),
      ]))
    }
    `
  }

  toEncoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      ${this.printCommonCode()}
      for (let i = 0; i < finalTuples.length; i++) {
        const [i1, i2] = finalTuples[i]

        ;[array[i1], array[i2]] = [array[i2], array[i1]]
      }

      return array.join('')
    }
    `
  }

  toDecoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      ${this.printCommonCode()}
      for (let i = finalTuples.length - 1; i >= 0; i--) {
        const [i1, i2] = finalTuples[i]

        ;[array[i1], array[i2]] = [array[i2], array[i1]]
      }

      return array.join('')
    }
    `
  }
}

class InverseStringScramblerPart {
  toEncoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      return string.split('').reverse().join('')
    }
    `
  }

  toDecoderString(functionName) {
    return this.toEncoderString(functionName)
  }
}

class CharacterOffseterScramblerPart {

  constructor() {
    this.seed = randomRange(1, 65535)
  }

  toEncoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      const passwordOffsets = password.split('').map(char => char.codePointAt(0))

      return string
      .split('')
      .map((char, i) => {
        const offset = ${this.seed} + passwordOffsets[i % (passwordOffsets.length - 1)]
        let nextCodePoint = char.codePointAt(0) + offset

        if (nextCodePoint > 65535) nextCodePoint %= 65535

        return String.fromCodePoint(nextCodePoint)
      })
      .join('')
    }
    `
  }

  toDecoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      const passwordOffsets = password.split('').map(char => char.codePointAt(0))

      return string
      .split('')
      .map((char, i) => {
        const offset = ${this.seed} + passwordOffsets[i % (passwordOffsets.length - 1)]
        let nextCodePoint = char.codePointAt(0) - offset

        if (nextCodePoint < 0) nextCodePoint += 65535

        return String.fromCodePoint(nextCodePoint)
      })
      .join('')
    }
    `
  }
}

module.exports = [
  CharactersAdderScramblerPart,
  CharacterSwapperScramblerPart,
  InverseStringScramblerPart,
  CharacterOffseterScramblerPart,
]
