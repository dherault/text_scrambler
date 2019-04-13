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
const tournament = require('../src/tournament')

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

describe('ScramblerPart', () => {

  const password = 'password'

  scramblerParts.forEach(ScramblerPart => {
    describe(ScramblerPart.name, () => {
      it('should encore and decode a string given a password', () => {

        for (let i = 0; i < strings.length; i++) {
          for (let j = 0; j < 3; j++) {
            const string = strings[i]
            const scramblerPart = new ScramblerPart()

            const fileContent = `\
            ${dependenciesString}
            const password = ${JSON.stringify(password)}
            const string = ${JSON.stringify(string)}
            ${scramblerPart.toEncoderString('encode')}
            ${scramblerPart.toDecoderString('decode')}
            const encodedString = encode(dependencies, string, password)
            const decodedString = decode(dependencies, encodedString, password)
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

  const password = 'password'

  it('should encode and decode a string', () => {

    for (let i = 0; i < strings.length; i++) {
      const string = strings[i]
      const scrambler = new Scrambler()

      scramblerParts.forEach(ScramblerPart => {
        scrambler.addScramblerPart(new ScramblerPart())
      })

      const encoderFileContent = scrambler.toEncoderString()
      const encoderFileName = `test-Scrambler-encoder-${i}.js`
      const encoderFile = path.join(tmpDirectory, encoderFileName)

      fs.writeFileSync(encoderFile, encoderFileContent)

      const decoderFileContent = scrambler.toDecoderString()
      const decoderFileName = `test-Scrambler-decoder-${i}.js`
      const decoderFile = path.join(tmpDirectory, decoderFileName)

      fs.writeFileSync(decoderFile, decoderFileContent)

      const fileContent = `\
      const encode = require('./${encoderFileName}')
      const decode = require('./${decoderFileName}')

      const string = ${JSON.stringify(string)}
      const password = ${JSON.stringify(password)}

      const encodedString = encode(string, password)
      const decodedString = decode(encodedString, password)

      console.log(decodedString)
      `
      const fileName = `test-Scrambler-caller-${i}.js`
      const file = path.join(tmpDirectory, fileName)

      fs.writeFileSync(file, fileContent)

      const output = execSync(`node ${file}`).toString().slice(0, -1)

      expect(output).to.be.equal(string)

      cleanupTmpDirectory()
    }
  })
})

describe('tournament', () => {

  it('should return a Scrambler', () => {
    const config = {
      minimumStringLength: 10,
      minimumPasswordLength: 8,
      complexity: 6,
      reproductionParentsCount: 3,
      reproductionChildrenCount: 6,
      mutationFactor: 0.33,
      generationsCount: 3,
    }

    const scrambler = tournament(config)

    expect(scrambler.constructor).to.be.equal(Scrambler)
  })
})
