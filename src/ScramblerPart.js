const { randomRange } = require('./utils')
const characters = require('./characters')

class CharactersAdderScramblerPart {

  toEncoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      const score = dependencies.computeStringScore(dependencies, password).toString()
      const step = parseInt(score.charAt(0)) + parseInt(score.charAt(score.length - 1))

      for (let i = 0; i < string.length; i += step) {
        string = string.slice(0, i) + dependencies.randomArray(dependencies.characters) + string.slice(i)
      }

      return string
    }
    `
  }

  toDecoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      const score = dependencies.computeStringScore(dependencies, password).toString()
      const step = parseInt(score.charAt(0)) + parseInt(score.charAt(score.length - 1))

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

  writeFinalTuples() {
    return `
    const masterTuples = ${JSON.stringify(this.tuples)}.map(tuple => tuple.map(d => Math.floor(string.length * d))
    const passwordIndexes = password.split('').map(char => dependencies.characters.indexOf(char))
    const minPasswordIndex = Math.min(...passwordIndexes)
    const tuplesIndexes = [...(new Set(passwordIndexes.map(index => index - minPasswordIndex)))]
    const tuples = tuplesIndexes.map(index => masterTuples[index]).filter(tuple => tuple)
    const finalTuples = [...tuples]

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
      ${this.writeFinalTuples()}

      const array = string.split('')

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
      ${this.writeFinalTuples()}

      const array = string.split('')

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

class InverseStringFromMiddleScramblerPart {
  toEncoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      const array = string.split('')
      const middle = Math.floor(array.length / 2)
      const score = dependencies.computeStringScore(dependencies, password).toString()
      const step = parseInt(score.charAt(0)) + parseInt(score.charAt(score.length - 1))

      for (let i = Math.floor(array.length / 2); i >= 0; i -= step) {
        [array[i], array[array.length - i]] = [array[array.length - i], array[i]]
      }

      return array.join('')
    }
    `
  }

  toDecoderString(functionName) {
    return this.toEncoderString(functionName)
  }
}

class CharacterOffseterScramblerPart {

  constructor() {
    this.seed = randomRange(0, characters.length - 1)
  }

  toEncoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      const l = dependencies.characters.length
      const passwordOffsets = password.split('').map(char => dependencies.characters.indexOf(char))

      return string
      .split('')
      .map((char, i) => {
        const offset = ${this.seed} + passwordOffsets[i % (passwordOffsets.length - 1)]
        let offsetedIndex = dependencies.characters.indexOf(char) + offset

        if (offsetedIndex >= l) offsetedIndex %= l

        return dependencies.characters[offsetedIndex]
      })
      .join('')
    }
    `
  }

  toDecoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      const l = dependencies.characters.length
      const passwordOffsets = password.split('').map(char => dependencies.characters.indexOf(char))

      return string
      .split('')
      .map((char, i) => {
        const offset = ${this.seed} + passwordOffsets[i % (passwordOffsets.length - 1)]
        let offsetedIndex = dependencies.characters.indexOf(char) - offset

        if (offsetedIndex < 0) offsetedIndex = l + offsetedIndex % l
        if (offsetedIndex >= l) offsetedIndex %= l

        return dependencies.characters[offsetedIndex]
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
  InverseStringFromMiddleScramblerPart,
  CharacterOffseterScramblerPart,
]
