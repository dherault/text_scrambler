const tournament = require('./tournament')

tournament({
  minimumStringLength: 10,
  minimumPasswordLength: 8,
  complexity: 10,
  reproductionParentsCount: 3,
  reproductionChildrenCount: 6,
  mutationFactor: 0.33,
})
