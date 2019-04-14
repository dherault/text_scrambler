const fs = require('fs')
const path = require('path')
const tournament = require('./tournament')

const defaultOptions = {
  complexity: 6,
  generationsCount: 6,
  reproductionParentsCount: 2,
  reproductionChildrenCount: 6,
  mutationFactor: 0.33,
  encoderFileName: 'encoder.js',
  decoderFileName: 'decoder.js',
}

function generateScrambler(useroptions) {
  const options = Object.assign({}, defaultOptions, useroptions)

  const scrambler = tournament(options)

  if (typeof options.directory === 'string') {
    if (!fs.existsSync(options.directory)) {
      fs.mkdirSync(options.directory)
    }

    const encoderFileContent = scrambler.toEncoderString()
    const encoderFile = path.join(options.directory, options.encoderFileName)

    fs.writeFileSync(encoderFile, encoderFileContent)

    const decoderFileContent = scrambler.toDecoderString()
    const decoderFile = path.join(options.directory, options.decoderFileName)

    fs.writeFileSync(decoderFile, decoderFileContent)
  }

  return scrambler
}

module.exports = generateScrambler
