# MeGotsThis Layouts
This is the stream layouts used by MeGotsThis.

This is based on [SGDQ 2017 layouts](https://github.com/GamesDoneQuick/sgdq17-layouts) but heavilied modified.

# Why use NodeCG instead built-in sources by OBS?
One of my speedruns is running two games with one controller. The problem with that is playing both audio streams can be terrible experience. So to make it play one or both game audio sources dynamically, I used Voicemeeter allow seperate audio sources to occur in OBS. Because of Voicemeeter Banana, I can listen to both game audio while have 1 game audio on stream. The next problem is to how to represent which audio source is active, before I would create 4 scenes (mute both, game 1, game 2, both games) to each audio source to be active. It does not scale well with 3 games or to change games. So NodeCG is quite the solution.

The next problem is that I wanted to not change LiveSplit layout to match the OBS scene I was using. Switching from 2 games 1 controller to a single game can be a cumbersome task that could be automated. Also there are times where I don't want to use the webcam (another factor into the layout). So NodeCG also fixes that.

# Requirements

- [NodeCG v0.9.x](https://github.com/nodecg/nodecg/releases)
- [Node.js v7 or greater](https://nodejs.org/)
- [LiveSplit WebSocket Server](https://github.com/MeGotsThis/LiveSplit.WebSocketServer/releases) (optional)
- [VoiceMeeter Banana](http://www.vb-audio.com/Voicemeeter/banana.htm) (optional)
- [Google Play Music Desktop Player](https://www.googleplaymusicdesktopplayer.com/) (optional)

# Examples
![2 Games 1 Controller Gameboy Layout](/examples/2g1c.png)

![Desktop Layout](/examples/desktop.png)
