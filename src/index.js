const tournament = require('./tournament')

const defaultOptions = {
  complexity: 6,
  generationsCount: 6,
  reproductionParentsCount: 2,
  reproductionChildrenCount: 6,
  mutationFactor: 0.33,
}

function generateScrambler(useroptions) {
  const options = Object.assign({}, defaultOptions, useroptions)

  const scrambler = tournament(options)

  // TODO: encode and decode files
  // TODO: rename the lib
  return scrambler
}

module.exports = generateScrambler
