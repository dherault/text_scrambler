const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { describe, it, beforeEach } = require('mocha')
const { expect } = require('chai')

const computeStringEntropy = require('../src/computeStringEntropy')
const { CharactersAdderScramblerPart, CharacterSwitcherScramblerPart, printDependencies } = require('../src/ScramblerPart')

const strings = require('./data/strings')

const tmpDirectory = path.join(__dirname, 'tmp')

function cleanupTmpDirectory() {
  const files = fs.readdirSync(tmpDirectory)

  for (const file of files) {
    fs.unlinkSync(path.join(tmpDirectory, file));
  }
}

const dependenciesString = printDependencies()

describe('computeStringEntropy', () => {

  it('should return a number', () => {
    strings.forEach(string => {
      expect(computeStringEntropy(string)).to.be.a('number')
    })
  })

  it('should be consistant', () => {
    expect(computeStringEntropy('a') === computeStringEntropy('a'))
    expect(computeStringEntropy('a') === computeStringEntropy('b'))
    expect(computeStringEntropy('ab') === computeStringEntropy('ba'))
    expect(computeStringEntropy('a') < computeStringEntropy('ab'))
    expect(computeStringEntropy('ab') < computeStringEntropy('abc'))
  })
})

describe('ScramblerPart', () => {

  const config = {
    minimumPasswordLength: 5,
  }

  const password = 'password'

  ;[
    CharactersAdderScramblerPart,
    CharacterSwitcherScramblerPart,
  ]
  .forEach(ScramblerPart => {
    describe(ScramblerPart.name, () => {
      it('should encore and decode a string given a password', () => {

        for (let i = 0; i < strings.length; i++) {
          const string = strings[i]
          const scramblerConfig = Object.assign({ minimumStringLength: string.length }, config)
          const scramblerPart = new ScramblerPart(scramblerConfig)

          const fileContent = `
          ${dependenciesString}
          const password = \`${password}\`
          const string = \`${string}\`
          ${scramblerPart.toEncoderString('encode')}
          ${scramblerPart.toDecoderString('decode')}
          const encodedString = encode(dependencies, string, password)
          const decodedString = decode(dependencies, encodedString, password)
          console.log(decodedString)
          `

          const fileName = `test-${ScramblerPart.name}-${i}.js`
          const file = path.join(tmpDirectory, fileName)

          fs.writeFileSync(file, fileContent)

          const output = execSync(`node ${file}`).toString().slice(0, -1)

          cleanupTmpDirectory()

          expect(output).to.be.equal(string)
        }
      })
    })
  })
})
