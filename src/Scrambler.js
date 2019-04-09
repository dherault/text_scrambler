const beautify = require('js-beautify').js
const printDependencies = require('./printDependencies')
const { randomArray } = require('./utils')

let id = 0

class Scrambler {
  constructor() {
    this.id = id++
    this.scramblerParts = []
  }

  addScramblerPart(scramblerPart) {
    this.scramblerParts.push(scramblerPart)
  }

  getRandomScramblerPart() {
    return randomArray(this.scramblerParts)
  }

  toEncoderString() {
    const encodeFunctionNames = this.scramblerParts.map((scramblerPart, i) => `encode${i + 1}`)

    const encoderFileContent = `
    ${printDependencies()}
    ${this.scramblerParts.map((scramblerPart, i) => scramblerPart.toEncoderString(encodeFunctionNames[i])).join('\n')}
    function encode(string, password) {
      let encodedString = string

      ${encodeFunctionNames.map(functionName => `
        encodedString = ${functionName}(dependencies, encodedString, password)
      `).join('')}

      return encodedString
    }

    module.exports = encode
    `


    return beautify(encoderFileContent.replace(/\n\n/gm, '\n'), {
      indent_size: 2,
    })
  }

  toDecoderString(shouldPrintDependencies) {
    const decodeFunctionNames = this.scramblerParts.map((scramblerPart, i) => `decode${i + 1}`)

    const decoderFileContent = `
    ${shouldPrintDependencies ? printDependencies() : ''}
    ${this.scramblerParts.map((scramblerPart, i) => scramblerPart.toDecoderString(decodeFunctionNames[i])).join('\n')}
    function decode(string, password) {
      let decodedString = string

      ${decodeFunctionNames.reverse().map(functionName => `
        decodedString = ${functionName}(dependencies, decodedString, password)
      `).join('')}

      return decodedString
    }

    module.exports = decode
    `


    return beautify(decoderFileContent.replace(/\n\n/gm, '\n'), {
      indent_size: 2,
    })
  }
}

module.exports = Scrambler
