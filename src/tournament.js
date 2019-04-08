const Scrambler = require('./Scrambler')
const scramblerParts = require('./ScramblerPart')
const { randomArray } = require('./utils')

function tournament(config) {
  const scramblers = []

  console.log('config', config)
  for (let i = 0; i < config.reproductionCount; i++) {
    const scrambler = new Scrambler()

    for (let k = 0; k < config.complexity; k++) {
      const ScramblerPart = randomArray(scramblerParts)

      scrambler.addScramblerPart(new ScramblerPart(config))
    }

    scramblers.push(scrambler)
  }

  const evolvedScramblers = evolve(scramblers)

  console.log(evolvedScramblers)
}

function evolve(scramblers) {
  const evolvedScramblers = [...scramblers]


  return evolvedScramblers
}

module.exports = tournament
