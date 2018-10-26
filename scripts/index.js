const { getRandomNums } = require('../lib/util')

module.exports = (robot) => {
  // 开始游戏
  robot.respond(/开始(.*)/,(res) => {
    const userList = res.match[1]
    console.log(res.envelope)
    room = res.envelope.user.name

    /*
      记录下每局比赛中每个选手的骰子
      {
        'jimczj' : {
          'id': '1',
          'members': ['jimczj','other'],
          'data': {
            'jimczj': '1,2,2,4,6',
            'other': '1,2,2,4,6'
          },
          'lastAnswer': ''
          'status': 'on' // off
        },
        'other': {
          'gamingRoom': 'jimczj' //在该房间玩游戏
        }
      }
    */
    const members = ['jimczj','other'] // 假数据
    let game = robot.brain.get(room)
    let gameId = 1
    if (game) {
      game = JSON.parse(game)
      gameId = game.id + 1
      if (game.gamingRoom) {
        let gamingRoom = robot.brain.get(game.gamingRoom)
        gamingRoom = JSON.parse(gamingRoom)
        // 在别人的游戏里面
        if (gamingRoom.status === 'on') {
          return res.reply(`${game.gamingRoom}上次开启的第${game.id}局游戏还在跟${game.members}对战中，请回复【关闭】，关闭该轮游戏。`)
        }
        // 自己开启的游戏还在进行
        if (game.status === 'on') {
          // 未结束，不能重新开启
          return res.reply(`您上次开启的第${game.id}局游戏还在跟${game.members}对战中，请回复【关闭】，关闭该轮游戏。`)
        }
      }
      if (game.status === 'on') {
        // 未结束，需要关闭
        return res.reply(`您上次开启的第${game.id}局游戏还在跟${game.members}对战中，请回复【关闭】，关闭该轮游戏。`)
      }

    }
    // 上一局已结束或用户没玩过游戏，开启新一局
    game = {
      'id': gameId,
      'members': members,
      'data': {
      },
      'lastAnswer': '',
      'status': 'on'
    }

    for (const member of members) {
      // 设置玩家游戏房间，一个玩家只能同时在一个房间
      robot.brain.set(member, JSON.stringify({
        gamingRoom: room
      }))
      // 生成骰子数据
      game.data[member] = getRandomNums()
    }
    console.log(game)
    robot.brain.set(room, JSON.stringify(game))
    return res.reply(`
      ${room} 的第${game.id}场游戏开始，
      jimczj: ${game.data.jimczj}
    `)
    // return res.reply(`准备开始游戏了哦${userList}`)
  })
  // 结束游戏
  robot.respond(/(结束|关闭)/, (res) => {
    room = res.envelope.user.name
    let game = robot.brain.get(room)
    if (game) {
      game = JSON.parse(game)
      if (game.status === 'off') {
        return res.reply(`您现在没有正在对战的游戏，回复【开始】并@其他游戏选手，开启新的一局游戏`)
      }
      // 在其他人的房间里，也可以关闭该轮游戏
      if (game.gamingRoom) {
        game = JSON.parse(robot.brain.get(room))
      }
      game.status = 'off'
      robot.brain.set(room, JSON.stringify(game))
      return res.reply(`您已成功关闭${game.members}参与的游戏，回复【开始】并@其他游戏选手，开启新的一局游戏`)
    }
    return res.reply(`您现在没有正在对战中的游戏，回复【开始】并@其他游戏选手，开启新的一局游戏`)
  })
  // 进行游戏中 喊其他数字
  robot.respond(/([0-9]+)个([0-9])/, (res) => {
    username = res.envelope.user.name
  })
  // 进行游戏中 往上叠加
  robot.respond(/\+\s*([0-9]+)/, (res) => {
    const num = res.match[1]
    return res.reply(`居然敢叫这么多+${num}`)
  })
  // 玩家喊开，结束游戏
  robot.respond(/开$/, (res) => {
    return res.reply(`结束游戏`)
  })
  // 其他情况
  robot.respond(/(.*)/, (res) => {
    return res.reply(`我听不懂你在说什么`)
  })
}
