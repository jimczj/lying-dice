const adviceAnswer = (data) => {
  const { number, count } = data
  const adviceCount = number === 6 ? count + 1 : count
  const adviceNumber = number === 6 ? number : number + 1
  return `${adviceCount}个${adviceNumber}`
}

module.exports = {
  getRandomNums(num = 5) {
    const result = []
    for(let i = 0;i < num; i++) {
      result.push(Math.floor(Math.random()*6)+1)
    }
    return result.sort()
  },
  getGame(robot,username) {
    let game = robot.brain.get(username)
    if (game) {
      game = JSON.parse(game)
      if (game.gamingRoom) {
        game = robot.brain.get(game.gamingRoom)
        game = JSON.parse(game)
        if (!game.data[username]) {
          // 以前的指向失效
          return null
        }
        return game
      }
      return game
    }
    return null
  },
  setGame(robot,data) {
    robot.brain.set(data.owner, JSON.stringify(data))
  },
  /*
    判断数据是否符合规则
    【1】 喊的个数最少为人头个数，此时为【斋】状态，只计算【1】的个数
    【2，3，4，5，6】喊的个数最少为人头个数 + 1，此时为【斋】状态，只计算喊的数字的个数
    【2，3，4，5，6】 喊的个数最少为人头个数 + 2，此时为【飞】状态，除了计算喊的数字个数，还计算【1】的个数
    下一轮选手喊的数字或个数要大于上一轮的选手，【1】除外(可以理解【1】最大)，比如：6个1 > 5个1 ，6个1 > 6个3 > 6个2
    【斋】状态时，只计算喊的数字的个数，
    【飞】状态时，除了计算喊的数字个数，还计算【1】的个数
    【斋】可以转【飞】状态，喊的数字要 + 人头个数
    【飞】可以转【斋】状态，喊的数字要 - 人头个数 + 1
  */
  judgeRules(data, count, number, computeMode = 0) {
    if (data.isFirstPlay) {
      // 第一次
      //【1】 喊的个数最少为人头个数，此时为【斋】状态，只计算【1】的个数
      //【2，3，4，5，6】喊的个数最少为人头个数 + 1，此时为【斋】状态，只计算喊的数字的个数
      //【2，3，4，5，6】 喊的个数最少为人头个数 + 2，此时为【飞】状态，除了计算喊的数字个数，还计算【1】的个数
      if (
        (number === 1 && count >= data.players.length)
        || (number > 1 && count >= data.players.length + 1)
      ) {
        return {
          'result': true
        }
      }
      return {
        'result': false,
        'message': `
          您的回答不符合游戏规则，
          游戏提示：
          【1】 喊的个数最少为人头个数，此时为【斋】状态，只计算【1】的个数
          【2，3，4，5，6】喊的个数最少为人头个数 + 1，此时为【斋】状态，只计算该数字的个数
          【2，3，4，5，6】 喊的个数最少为人头个数 + 2，此时为【飞】状态，除了计算该数字个数，还计算【1】的个数
          您可以喊：${adviceAnswer(data)}
        `
      }
    }
    // 第二次以上喊
    const dataNumber = data.number === 1 ? 7 : data.number
    const userNumber = number === 1 ? 7 : number
    if (data.computeMode === computeMode) {
      if (
        (userNumber > dataNumber && count >= data.count)
        || (count > data.count)
      ){
        return {
          'result': true,
        }
      }
      return {
        'result': false,
        'message': `
          您的回答不符合游戏规则，
          游戏提示：
          您可以喊：${adviceAnswer(data)}，或者【开】
        `
      }
    }
    let userCount = count
    let dataCount = data.count
    // 【斋】可以转【飞】状态，喊的数字要 + 人头个数
    // 【飞】可以转【斋】状态，喊的数字要 - 人头个数 + 1
    if (data.computeMode === 0 && computeMode === 1) {
      // 斋转飞
      dataCount += 2
      if (
        (userNumber > dataNumber && userCount >= dataCount)
        || (userCount > dataCount)
      ) {
        return {
          'result': true,
        }
      }
      return {
        'result': false,
        'message': `
          您的回答不符合游戏规则，
          游戏提示：
          【斋】转【飞】状态，喊的个数要 + 人头个数
          您可以喊：${adviceAnswer(data)}，或者【开】
        `
      }

    } else if (data.computeMode === 1 && computeMode === 0) {
      // 飞转斋
      userCount += data.players.length - 1
      if (
        (userNumber > dataNumber && userCount >= dataCount)
        || (userCount > dataCount)
      ) {
        return {
          'result': true,
        }
      }
      return {
        'result': false,
        'message': `
          您的回答不符合游戏规则，
          游戏提示：
          【飞】转【斋】状态，喊的个数要 - 人头个数 + 1
          您可以喊：${adviceAnswer(data)}，或者【开】
        `
      }
    }
    return {
      'result': false,
      'message': `
          您的回答不符合游戏规则
        `
    }
  }
}
