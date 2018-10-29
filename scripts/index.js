const { getRandomNums, getGame, setGame, judgeRules, getPlayers } = require('../lib/util')
/*
  redis 数据结构
  记录下每局比赛数据信息
  {
    'jimczj' : {
      'owner': 'jimczj',// 房主
      'id': '1',
      'players': ['jimczj','other'],// 玩家列表，按照顺序回答
      'data': {
        'jimczj': '1,2,2,4,6',// 玩家骰子数据
        'other': '1,2,2,4,6'
      },
      'current': 0,// 此轮玩家下标
      'computeMode': 0,// 0为斋，1为飞
      'number': 1,// 当前喊的数字
      'count': 5, // 当前喊的个数
      'status': 'on' // on 为游戏进行，off 为游戏结束
    },
    'other': {
      'gamingRoom': 'jimczj' //在该房间玩游戏
    }
  }
*/
module.exports = (robot) => {
  // 开始游戏
  robot.respond(/开始(.*)/,async (res) => {

    const channelId = res.envelope.room.vchannelId
    const username = res.envelope.user.name
    const message = res.match[1]
    const players = await getPlayers(message, channelId)
    let game = robot.brain.get(username)
    let gameId = 1
    if (game) {
      game = JSON.parse(game)
      gameId = game.id + 1
      if (game.gamingRoom) {
        let gamingRoom = robot.brain.get(game.gamingRoom)
        gamingRoom = JSON.parse(gamingRoom)
        // 在别人的游戏里面
        if (gamingRoom.status === 'on') {
          return res.reply(`${game.gamingRoom}上次开启的第${game.id}局游戏还在跟${game.players}对战中，请回复【关闭】，关闭该轮游戏。`)
        }
        // 自己开启的游戏还在进行
        if (game.status === 'on') {
          // 未结束，不能重新开启
          return res.reply(`您上次开启的第${game.id}局游戏还在跟${game.players}对战中，请回复【关闭】，关闭该轮游戏。`)
        }
      }
      if (game.status === 'on') {
        // 未结束，需要关闭
        return res.reply(`您上次开启的第${game.id}局游戏还在跟${game.players}对战中，请回复【关闭】，关闭该轮游戏。`)
      }

    }
    // 上一局已结束或用户没玩过游戏，开启新一局
    game = {
      'owner': username,
      'id': gameId,
      'players': players,
      'data': {
      },
      'current': 0,
      'computeMode': 0,// 0为斋，1为飞
      'number': 1,
      'count': players.length - 1,
      'status': 'on'
    }

    for (const player of players) {
      // 设置玩家游戏房间，一个玩家只能同时在一个房间
      setGame(robot, { gamingRoom: username })
      // 生成骰子数据
      game.data[player] = getRandomNums()
    }
    setGame(robot, game)
    return res.reply(`
      ${username} 的第${game.id}场游戏开始，
      jimczj: ${game.data.jimczj}
    `)
    // return res.reply(`准备开始游戏了哦${userList}`)
  })
  // 结束游戏
  robot.respond(/(结束|关闭)/, (res) => {
    username = res.envelope.user.name
    let game = robot.brain.get(username)
    if (game) {
      game = JSON.parse(game)
      if (game.status === 'off') {
        return res.reply(`您现在没有正在对战的游戏，回复【开始】并@其他游戏选手，开启新的一局游戏`)
      }
      // 在其他人的房间里，也可以关闭该轮游戏
      if (game.gamingRoom) {
        game = JSON.parse(robot.brain.get(username))
      }
      game.status = 'off'
      setGame(robot, game)
      return res.reply(`您已成功关闭${game.players}参与的游戏，回复【开始】并@其他游戏选手，开启新的一局游戏`)
    }
    return res.reply(`您现在没有正在对战中的游戏，回复【开始】并@其他游戏选手，开启新的一局游戏`)
  })
  /*
    进行游戏中 喊其他数字
    【1】 喊的个数最少为人头个数，此时为【斋】状态，只计算【1】的个数
    【2，3，4，5，6】喊的个数最少为人头个数 + 1，此时为【斋】状态，只计算喊的数字的个数
    【2，3，4，5，6】 喊的个数最少为人头个数 + 2，此时为【飞】状态，除了计算喊的数字个数，还计算【1】的个数
    下一轮选手喊的数字或个数要大于上一轮的选手，【1】除外(可以理解【1】最大)，比如：6个1 > 5个1 ，6个1 > 6个3 > 6个2
    【斋】状态时，只计算喊的数字的个数，
    【飞】状态时，除了计算喊的数字个数，还计算【1】的个数
    【斋】可以转【飞】状态，喊的数字要 + 人头个数
    【飞】可以转【斋】状态，喊的数字要 - （人头个数+1）
  */
  robot.hear(/([0-9]+)\s*个\s*([0-9])\s*([斋|飞])*/, (res) => {
    const username = res.envelope.user.name
    const count = parseInt(res.match[1])
    const number = parseInt(res.match[2])
    const computeModeStr = res.match[3]
    // const { n, number, count, computeMode } = res.match
    console.log('number:', number, 'count:', count, 'computeMode:', computeModeStr)
    const game = getGame(robot,username)
    if (game && game.status === 'on') {
      // 判断发言人
      if (username !== game.player[game.current]) {
        return res.reply(`还没轮到你哦，现在是由@${game.player[game.current]}回答`)
      }
      // 判断数据是否符合规则
      let computeMode = game.computeMode
      if (computeModeStr && computeModeStr.contains('飞')) {
        computeMode = 1
      } else if (computeModeStr && computeModeStr.contains('斋')) {
        computeMode = 0
      }
      const judgeResult = judgeRules(game, count, number, computeMode)
      if (!judgeResult.result) {
        return res.reply(judgeResult.message)
      }
      const current = game.current
      game.number = number
      game.count = count
      game.computeMode = computeMode
      game.current = current + 1 % game.players.length
      setGame(robot, game)
      return res.reply(`
        玩家@${game.players[current]}喊了【${count}个${number}】，轮到@${game.players[game.current]}喊数
      `)
    }
    res.reply('您现在没有正在进行的游戏')
  })
  /*
  redis 数据结构
  记录下每局比赛数据信息
  {
    'jimczj' : {
      'id': '1',
      'players': ['jimczj','other'],
      'data': {
        'jimczj': '1,2,2,4,6',
        'other': '1,2,2,4,6'
      },
      'current': 0,
      'computeMode': 0,// 0为斋，1为飞
      'number': 1,// 当前喊的数字
      'count': 5, // 当前喊的个数
      'status': 'on' // off
    },
    'other': {
      'gamingRoom': 'jimczj' //在该房间玩游戏
    }
  }
*/
  // 进行游戏中 往上叠加
  robot.hear(/\+\s*([0-9]+)/, (res) => {
    const num = res.match[1]
    return res.reply(`居然敢叫这么多+${num}`)
  })
  // 玩家喊开，结束游戏
  robot.respond(/开$/, (res) => {
    return res.reply(`结束游戏`)
  })
}
