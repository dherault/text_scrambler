const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { describe, it } = require('mocha')
const { expect } = require('chai')

const strings = require('./data/strings')

const { computeStringEntropy } = require('../src/utils')
const printDependencies = require('../src/printDependencies')
const Scrambler = require('../src/Scrambler')
const scramblerParts = require('../src/ScramblerPart')

const [CharactersAdderScramblerPart, CharacterSwapperScramblerPart] = scramblerParts
const tmpDirectory = path.join(__dirname, 'tmp')

function cleanupTmpDirectory() {
  const files = fs.readdirSync(tmpDirectory)

  // eslint-disable-next-line
  for (const file of files) {
    fs.unlinkSync(path.join(tmpDirectory, file))
  }
}

const dependenciesString = printDependencies()

if (!fs.existsSync(tmpDirectory)) {
  fs.mkdirSync(tmpDirectory)
}

describe('computeStringEntropy', () => {

  it('should return a number', () => {
    strings.forEach(string => {
      expect(computeStringEntropy(string)).to.be.a('number')
    })
  })

  it('should be consistant', () => {
    // eslint-disable-next-line
    expect(computeStringEntropy('a') === computeStringEntropy('a'))
    expect(computeStringEntropy('a') === computeStringEntropy('b'))
    expect(computeStringEntropy('ab') === computeStringEntropy('ba'))
    expect(computeStringEntropy('a') < computeStringEntropy('ab'))
    expect(computeStringEntropy('ab') < computeStringEntropy('abc'))
  })
})

describe.only('ScramblerPart', () => {

  const config = {
    minimumPasswordLength: 5,
  }

  const cipher = 'cipher'

  scramblerParts.forEach(ScramblerPart => {
    describe(ScramblerPart.name, () => {
      it('should encore and decode a string given a cipher', () => {

        for (let i = 0; i < strings.length; i++) {
          for (let j = 0; j < 10; j++) {
            const string = strings[i]
            const scramblerConfig = Object.assign({ minimumStringLength: string.length }, config)
            const scramblerPart = new ScramblerPart(scramblerConfig)

            const fileContent = `
            ${dependenciesString}
            const cipher = ${JSON.stringify(cipher)}
            const string = ${JSON.stringify(string)}
            for (const char of string) {
              if (!dependencies.characters.includes(char)) {
                dependencies.characters.push(char)
              }
            }
            ${scramblerPart.toEncoderString('encode')}
            ${scramblerPart.toDecoderString('decode')}
            const encodedString = encode(dependencies, string, cipher)
            const decodedString = decode(dependencies, encodedString, cipher)
            console.log(decodedString)
            `

            const fileName = `test-${ScramblerPart.name}-${i}-${j}.js`
            const file = path.join(tmpDirectory, fileName)

            fs.writeFileSync(file, fileContent)

            const output = execSync(`node ${file}`).toString().slice(0, -1)

            cleanupTmpDirectory()

            expect(output).to.be.equal(string)
          }
        }
      })
    })
  })
})

describe('Scrambler', () => {

  const config = {
    minimumPasswordLength: 5,
  }

  const cipher = 'cipher'

  it('should encode and decode a string', () => {

    for (let i = 0; i < strings.length; i++) {
      const string = strings[i]
      const scramblerConfig = Object.assign({ minimumStringLength: string.length }, config)
      const scramblerPart1 = new CharactersAdderScramblerPart(scramblerConfig)
      const scramblerPart2 = new CharacterSwapperScramblerPart(scramblerConfig)
      const scrambler = new Scrambler()

      scrambler.addScramblerPart(scramblerPart1)
      scrambler.addScramblerPart(scramblerPart2)

      const encoderFileContent = scrambler.toEncoderString()
      const encoderFileName = `test-Scrambler-encoder-${i}.js`
      const encoderFile = path.join(tmpDirectory, encoderFileName)

      fs.writeFileSync(encoderFile, encoderFileContent)

      const decoderFileContent = scrambler.toDecoderString()
      const decoderFileName = `test-Scrambler-decoder-${i}.js`
      const decoderFile = path.join(tmpDirectory, decoderFileName)

      fs.writeFileSync(decoderFile, decoderFileContent)

      const fileContent = `
      const encode = require('./${encoderFileName}')
      const decode = require('./${decoderFileName}')

      const string = ${JSON.stringify(string)}
      const cipher = ${JSON.stringify(cipher)}

      const encodedString = encode(string, cipher)
      const decodedString = decode(encodedString, cipher)

      console.log(decodedString)
      `
      const fileName = `test-Scrambler-caller-${i}.js`
      const file = path.join(tmpDirectory, fileName)

      fs.writeFileSync(file, fileContent)

      const output = execSync(`node ${file}`).toString().slice(0, -1)

      cleanupTmpDirectory()

      expect(output).to.be.equal(string)
    }
  })
})
