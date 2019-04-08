const characters = require('./characters')
const { randomRange, randomArray, computeStringScore } = require('./utils')

function printDependencies() {
  return `
  const dependencies = {
    randomRange: ${randomRange},
    randomArray: ${randomArray},
    computeStringScore: ${computeStringScore},
    characters: ${JSON.stringify(characters)},
  }
  `.trim()
}

module.exports = printDependencies