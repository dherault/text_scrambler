function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomArray(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function randomPop(array) {
  return array.splice(Math.floor(Math.random() * array.length), 1)[0]
}

function distortString(string, offset, characters) {
  return string.split('').map(char => character[characters.indexOf(char) + offset] || characters[0]).join('')
}

module.exports = {
  randomRange,
  randomArray,
  randomPop,
  distortString,
}
