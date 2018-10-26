const { getRandomNums } = require('../lib/util')

/*
  记录下每局比赛中每个选手的骰子
  'jimczj' : {
    'gameId': '1',
    'member': 'jimczj,other',
    'gameData': {
      'jimczj': '1,2,2,4,6',
      'other': '1,2,2,4,6'
    },
    'status': 'on' // off
  }
*/
module.exports = (robot) => {
  robot.respond(/开始(.*)/,(res) => {
    const userList = res.match[1]
    console.log(res.envelope)
    room = res.envelope.user.name

    /*
      记录下每局比赛中每个选手的骰子
      'jimczj' : {
        'id': '1',
        'members': 'jimczj,other',
        'data': {
          'jimczj': '1,2,2,4,6',
          'other': '1,2,2,4,6'
        },
        'lastAnswer': ''
        'status': 'on' // off
      }
    */
    const members = ['jimczj','other'] // 假数据

    let game = robot.brain.get(room)
    let gameId = 1
    if (game) {
      game = JSON.parse(game)
      gameId = game.id + 1
      if (game.status === 'on') {
        // 未结束，不能重新开启
        return res.reply(`您上次开启的第${game.id}局游戏还在跟${game.members}对战中，请回复关闭，关闭该轮游戏。`)
      }
    }
    // 上一局已结束，重新开启新一局
    game = {
      'id': gameId,
      'members': members,
      'data': {
      },
      'lastAnswer': '',
      'status': 'on'
    }
    // 生成骰子数据
    for (const member of members) {
      game.data[member] = getRandomNums()
    }
    console.log(game)
    robot.brain.set(room, JSON.stringify(game))
    return res.reply(`
      ${room} 的第${game.id}开始，
      ${game.data}
    `)
    // return res.reply(`准备开始游戏了哦${userList}`)
  })
}
