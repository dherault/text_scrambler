const Scrambler = require('./Scrambler')
const scramblerParts = require('./ScramblerPart')
const { randomArray, randomPop, randomRange } = require('./utils')

function tournament(config) {
  const scramblers = []

  console.log('config', config)

  for (let i = 0; i < config.reproductionParentsCount; i++) {
    const scrambler = new Scrambler()

    for (let k = 0; k < config.complexity; k++) {
      const ScramblerPart = randomArray(scramblerParts)

      scrambler.addScramblerPart(new ScramblerPart(config))
    }

    scramblers.push(scrambler)
  }

  const evolvedScramblers = evolve(config, scramblers)

  // console.log(evolvedScramblers)
}

function evolve(config, scramblers) {
  const evolvedScramblers = [...scramblers]

  for (let k = 0; k < config.reproductionChildrenCount; k++) {
    const child = new Scrambler()
    const complexities = []

    for (let i = 0; i < config.reproductionParentsCount; i++) {
      // pick complexity scramblerParts from parents
      const complexitiesSum = complexities.reduce((a, b) => a + b, 0)
      const complexity = i === config.reproductionParentsCount - 1
        ? config.complexity - complexitiesSum
        : randomRange(1, config.complexity - complexitiesSum - (config.reproductionParentsCount - i - 1))

      complexities.push(complexity)

      const scramblerParts = scramblers[i].scramblerParts.slice()

      for (let j = 0; j < complexity; j++) {
        child.addScramblerPart(randomPop(scramblerParts))
      }
    }

    // Randomize scramblerParts order
    child.scramblerParts.sort((a, b) => Math.random() > 0.5 ? -1 : 1)

    console.log(child.scramblerParts.length)
  }

  return evolvedScramblers
}

module.exports = tournament
