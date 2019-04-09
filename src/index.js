const fs = require('fs')
const { execSync } = require('child_process')
const tmp = require('tmp')
const tournament = require('./tournament')

const testString = `
Voilà cinq semaines que j’habite avec cette pensée, toujours seul avec elle, toujours glacé de sa présence, toujours courbé sous son poids !
Autrefois, car il me semble qu’il y a plutôt des années que des semaines, j’étais un homme comme un autre homme. Chaque jour, chaque heure, chaque minute avait son idée. Mon esprit, jeune et riche, était plein de fantaisies. Il s’amusait à me les dérouler les unes après les autres, sans ordre et sans fin, brodant d’inépuisables arabesques cette rude et mince étoffe de la vie. C’étaient des jeunes filles, de splendides chapes d’évêque, des batailles gagnées, des théâtres pleins de bruit et de lumière, et puis encore des jeunes filles et de sombres promenades la nuit sous les larges bras des marronniers. C’était toujours fête dans mon imagination. Je pouvais penser à ce que je voulais, j’étais libre.
Maintenant je suis captif. Mon corps est aux fers dans un cachot, mon esprit est en prison dans une idée. Une horrible, une sanglante, une implacable idée ! Je n’ai plus qu’une pensée, qu’une conviction, qu’une certitude : condamné à mort !
`
const testPassword = 'password123'

const scrambler = tournament({
  minimumStringLength: testString.length,
  minimumPasswordLength: testPassword.length,
  complexity: 12,
  reproductionParentsCount: 3,
  reproductionChildrenCount: 6,
  mutationFactor: 0.33,
  generationsCount: 10,
})

console.log(scrambler)

const file = tmp.fileSync({
  prefix: 'text_scrambler_final_',
  postfix: '.js',
})

fs.writeFileSync(file.name, `
${scrambler.toEncoderString()}
${scrambler.toDecoderString(false)}

const string = ${JSON.stringify(testString)}
const password = ${JSON.stringify(testPassword)}
const encoded = encode(string, password)
console.log(encoded)

console.log('password123')
console.log(decode(encoded, 'password123'))
console.log('password120')
console.log(decode(encoded, 'password120'))
console.log('password000')
console.log(decode(encoded, 'password000'))
console.log('321drowssap')
console.log(decode(encoded, '321drowssap'))
console.log('01234567890')
console.log(decode(encoded, '01234567890'))
`)

const output = execSync(`node ${file.name}`).toString()

console.log(output)
