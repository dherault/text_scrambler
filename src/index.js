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

  return tournament(options)
}

module.exports = generateScrambler
