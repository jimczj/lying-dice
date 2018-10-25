const { getRandomNums } = require('../lib/util')

module.exports = (robot) => {
  robot.respond(/开始(.*)/,(res) => {
    const userList = res.match[1]
    return res.reply(`准备开始游戏了哦${userList}`)
  })
}
