const fs = require('fs')
const { execSync } = require('child_process')
const tmp = require('tmp')
const levenshtein = require('js-levenshtein')
const Scrambler = require('./Scrambler')
const scramblerParts = require('./ScramblerPart')
const characters = require('./characters')
const { randomArray, randomPop, randomRange, computeStringEntropy } = require('./utils')

const scramblerDiversity = {}

characters
.forEach((char, i) => {
  if (scramblerParts[i]) {
    scramblerDiversity[scramblerParts[i].name] = char
  }
})

function tournament(config) {
  let scramblers = []

  console.log('config', config)

  for (let i = 0; i < config.reproductionParentsCount; i++) {
    const scrambler = new Scrambler()

    for (let k = 0; k < config.complexity; k++) {
      const ScramblerPart = randomArray(scramblerParts)

      scrambler.addScramblerPart(new ScramblerPart(config))
    }

    scramblers.push(scrambler)
  }

  for (let generation = 0; generation < config.generationsCount; generation++) {
    scramblers = scramblers.slice(0, config.reproductionParentsCount)
    scramblers = evolve(config, scramblers)

    addScoreToScramblers(scramblers)

    scramblers.sort((a, b) => a.score > b.score ? -1 : 1)

    console.log('GENERATION', generation + 1)
    console.log(scramblers.map(s => [s.id, s.score]))
  }

  return scramblers[0]
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
    child.scramblerParts.sort(() => Math.random() > 0.5 ? -1 : 1)

    // Mutate child
    const mutations = []

    for (let i = Math.floor(config.complexity * config.mutationFactor); i >= 0; i--) {
      const ScramblerPart = randomArray(scramblerParts)

      mutations.push(new ScramblerPart(config))
    }

    const indexes = child.scramblerParts.map((scramblerPart, i) => i)

    mutations.forEach(mutation => {
      const index = randomPop(indexes)

      child.scramblerParts[index] = mutation
    })

    evolvedScramblers.push(child)
  }

  return evolvedScramblers
}

const testString = `
Voilà cinq semaines que j’habite avec cette pensée, toujours seul avec elle, toujours glacé de sa présence, toujours courbé sous son poids !
Autrefois, car il me semble qu’il y a plutôt des années que des semaines, j’étais un homme comme un autre homme. Chaque jour, chaque heure, chaque minute avait son idée. Mon esprit, jeune et riche, était plein de fantaisies. Il s’amusait à me les dérouler les unes après les autres, sans ordre et sans fin, brodant d’inépuisables arabesques cette rude et mince étoffe de la vie. C’étaient des jeunes filles, de splendides chapes d’évêque, des batailles gagnées, des théâtres pleins de bruit et de lumière, et puis encore des jeunes filles et de sombres promenades la nuit sous les larges bras des marronniers. C’était toujours fête dans mon imagination. Je pouvais penser à ce que je voulais, j’étais libre.
Maintenant je suis captif. Mon corps est aux fers dans un cachot, mon esprit est en prison dans une idée. Une horrible, une sanglante, une implacable idée ! Je n’ai plus qu’une pensée, qu’une conviction, qu’une certitude : condamné à mort !
`
const testPassword = 'password123'

function addScoreToScramblers(scramblers) {
  scramblers.forEach(scrambler => {
    const file = tmp.fileSync({
      prefix: 'text_scrambler_scoring_',
      postfix: '.js',
    })

    fs.writeFileSync(file.name, `
    ${scrambler.toEncoderString()}

    const string = ${JSON.stringify(testString)}
    const cipher = ${JSON.stringify(testPassword)}
    console.log(encode(string, cipher))
    `)

    // console.log(scrambler)
    // console.log('executing', `node ${file.name}`)
    const encodedString = execSync(`node ${file.name}`).toString()

    const scramblerPartTypes = new Set()

    scrambler.scramblerParts.forEach(scramblerPart => scramblerPartTypes.add(scramblerPart.constructor.name))
    scrambler.score = Math.floor(levenshtein(testString, encodedString) * computeStringEntropy(encodedString) * scramblerPartTypes.size)
    // console.log(encodedString)
    // console.log('levenshtein(testString, encodedString)', levenshtein(testString, encodedString))
    // console.log('computeStringEntropy(encodedString)', computeStringEntropy(encodedString))
    // console.log('scramblerDiversityString', scramblerDiversityString, computeStringEntropy(scramblerDiversityString))
    // console.log(scrambler.score)
  })
}

module.exports = tournament
