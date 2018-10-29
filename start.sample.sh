#!/bin/bash
export HUBOT_BEARYCHAT_TOKENS=bearychat-token
export HUBOT_BEARYCHAT_MODE=rtm
export EXPRESS_PORT=7001
export REDIS_URL=redis://:password@localhost:6379/prefix
./bin/hubot -a bearychat
