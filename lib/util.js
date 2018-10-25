module.exports = {
  getRandomNums(num = 5) {
    const result = []
    for(let i = 0;i < num; i++) {
      result.push(Math.floor(Math.random()*6)+1)
    }
    return result.sort()
  }
}
