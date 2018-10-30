const assert = require('assert')
const config = require('../config.json')
const {
  judgeRules,
  getPlayers,
  getAllUserMap,
  getChannelUsersId,
  getUserListName
} = require('../lib/util')

describe('utils', () => {
  describe('#judgeRules 第一次喊',  () => {
    const data = {
      'owner': 'jimczj',
      'id': '1',
      'players': ['jimczj', 'other'],
      'data': {
        'jimczj': '1,2,2,4,6',
        'other': '1,2,2,4,6'
      },
      'isFirstPlay': true,
      'current': 0,
      'computeMode': 0,
      'number': 1,
      'count': 1,
      'status': 'on'
    }

    it('case:人头2，第一次喊 2个1 //true',() => {
      assert.equal(judgeRules(data, 2, 1).result, true)
    })

    it('case:人头2，第一次喊 2个2 //false', () => {
      assert.equal(judgeRules(data, 2, 2).result, false)
    })

    it('case:人头2，第一次喊 3个2 //true', () => {
      assert.equal(judgeRules(data, 3, 2).result, true)
    })

    // 第二次喊

    it('case:人头2，2个1，第二次喊 2个2 //false', () => {
      data.isFirstPlay = false
      data.number = 1
      data.count = 2
      assert.equal(judgeRules(data, 2, 2).result, false)
    })

    it('case:人头2，2个1，第二次喊 3个2 //true', () => {
      data.isFirstPlay = false
      data.number = 1
      data.count = 2
      assert.equal(judgeRules(data, 3, 2).result, true)
    })

    it('case:人头2，3个2，第二次喊 3个1 //true', () => {
      data.isFirstPlay = false
      data.count = 3
      data.number = 2
      assert.equal(judgeRules(data, 3, 1).result, true)
    })

    it('case:人头2，3个3，第二次喊 3个2 //false', () => {
      data.isFirstPlay = false
      data.count = 3
      data.number = 3
      assert.equal(judgeRules(data, 3, 2).result, false)
    })
    // 斋转飞
    it('case:人头2，3个3，第二次喊 4个2 飞 //false', () => {
      data.isFirstPlay = false
      data.count = 3
      data.number = 3
      assert.equal(judgeRules(data, 4, 2, 1).result, false)
    })
    it('case:人头2，3个3，第二次喊 5个3 飞 //false', () => {
      data.isFirstPlay = false
      data.count = 3
      data.number = 3
      assert.equal(judgeRules(data, 5, 3, 1).result, false)
    })
    it('case:人头2，3个3，第二次喊 5个4 飞 //true', () => {
      data.isFirstPlay = false
      data.count = 3
      data.number = 3
      assert.equal(judgeRules(data, 5, 4, 1).result, true)
    })

    it('case:人头2，4个3 飞，第二次喊 3个3 斋 //false', () => {
      data.isFirstPlay = false
      data.count = 4
      data.number = 3
      data.computeMode = 1
      assert.equal(judgeRules(data, 3, 3, 0).result, false)
    })

    it('case:人头2，4个3 飞，第二次喊 3个1 斋 //true', () => {
      data.isFirstPlay = false
      data.count = 4
      data.number = 3
      data.computeMode = 1
      assert.equal(judgeRules(data, 3, 1, 0).result, true)
    })
  })

  describe('#getPlayers', () => {
    it('正常获取players', async () => {
      const players = await getPlayers('@<==bxcMX=> 开始 @<==bxc4Z=>', config.channelId)
      console.log(players)
      assert.equal(players[0],'jimczj')
    })

    it('获取空players', async () => {
      const players = await getPlayers('@<==bxc4Z=> 开始 ', config.channelId)
      assert.equal(players.length, 0)
    })

    it('获取所有players', async () => {
      const players = await getPlayers('@<==bxcMX=> 开始 @<-channel->', config.channelId)
      console.log(players)
      assert.equal(2, 2)
    })
  })
  describe('#getAllUserMap', () => {
    it('获取全部用户，除去机器人', async () => {
      const players = await getAllUserMap()
      console.log(players)
      assert.equal(2, 2)
    })
  })

  describe('#getChannelUsersId', () => {
    it('获取该讨论组用户 uid', async () => {
      const players = await getChannelUsersId(config.channelId)
      console.log(players)
      assert.equal(2, 2)
    })
  })
  describe('#getUserListName', () => {
    it('通过uid列表获取用户名列表', async () => {
      const players = await getChannelUsersId(config.channelId)
      const usernames = await getUserListName(players)
      console.log(usernames)
      assert.equal(2, 2)
    })
  })

})
