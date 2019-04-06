const characters = require('./characters')
const computeStringScore = require('./computeStringScore')
const { randomRange, randomArray } = require('./utils')

class CharactersAdderScramblerPart {
  constructor(config) {
    super()

    this.seed = randomRange(-config.minimumPasswordLength + 1, 10)
  }

  toEncoderString(functionName) {
    return `
    function ${functionName}(dependencies, string, password) {
      const step = ${this.seed} + password.length

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
      const step = ${this.seed} + password.length

      for (let i = 0; i < string.length; i += step - 1) {
        string = string.slice(0, i) + string.slice(i + 1)
      }

      return string
    }
    `
  }
}

class CharacterSwitcherScramblerPart {
  constructor(config) {
    super()

    this.tuples = []
    this.minimumStringLength = config.minimumStringLength
    this.offset1 = randomRange(1, 10)
    this.offset2 = randomRange(1, 10)

    for (let i = 0; i < 100; i++) {
      this.tuples.push([
        randomRange(0, this.minimumStringLength - 1),
        randomRange(0, this.minimumStringLength - 1),
      ])
    }
  }

  writeFinalTuples() {
    return `
    const masterTuples = ${JSON.stringify(this.tuples)}
    const passwordIndexes = password.split('').map(char => dependencies.characters.indexOf(char))
    const minPasswordIndex = Math.min(...passwordIndexes)
    const tuplesIndexes = [...(new Set(passwordIndexes.map(index => index - minPasswordIndex)))]
    const tuples = tuplesIndexes.map(index => masterTuples[index]).filter(tuple => tuple)
    const finalTuples = [...tuples]

    for (let i = 0; i < ${this.minimumStringLength}; i++) {
      finalTuples.push(...tuples.map(([i1, i2]) => [
        Math.min(${this.minimumStringLength - 1}, i1 + i + ${this.offset1}),
        Math.min(${this.minimumStringLength - 1}, i2 + i + ${this.offset2}),
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
    return  `
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

function printDependencies() {
  return `
  const dependencies = {
    randomRange: ${randomRange},
    randomArray: ${randomArray},
    characters: ${JSON.stringify(characters)},
  };
  `
}

module.exports = {
  CharactersAdderScramblerPart,
  CharacterSwitcherScramblerPart,
  printDependencies,
}
