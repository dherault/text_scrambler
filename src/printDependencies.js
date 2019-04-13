const { randomRange, randomArray, computeStringScore } = require('./utils')

function printDependencies() {
  return `\
  const dependencies = {
    randomRange: ${randomRange},
    randomArray: ${randomArray},
    computeStringScore: ${computeStringScore},
  }`
}

module.exports = printDependencies
