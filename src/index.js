const tournament = require('./tournament')

tournament({
  minimumStringLength: 10,
  minimumPasswordLength: 8,
  complexity: 3,
  mutationFactor: 0.33,
  reproductionCount: 2,
})
