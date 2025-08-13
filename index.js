// minecraft.js — AN ANTI-AFK+ANTI-BAN + AUTO-RECONNECT BOT BY ARSH

const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');
const express = require('express');

function createBot() {
  const bot = mineflayer.createBot({
    host: 'Wbrother2nios.aternos.me',
    port: 26555,
    username: 'Rakshan2022',
    version: false
  });

  bot.loadPlugin(pathfinder);

  let waypoints = [];
  let memory = {};

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    // Continuous small random movement for anti-AFK
    setInterval(() => {
      const offset = () => (Math.random() * 10 - 5);
      const goal = new goals.GoalNear(
        bot.entity.position.x + offset(),
        bot.entity.position.y,
        bot.entity.position.z + offset(),
        1
      );
      bot.pathfinder.setGoal(goal, true);
    }, 15000);

    // Slight jumping randomly to prevent kick
    setInterval(() => {
      bot.setControlState('jump', Math.random() > 0.7);
    }, 5000);

    // Forward/backward random toggle to prevent AFK
    setInterval(() => {
      const forward = Math.random() > 0.5;
      bot.setControlState('forward', forward);
      bot.setControlState('back', !forward);
    }, 10000);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    const player = bot.players[username]?.entity;
    if (!player) return;

    const args = message.split(' ');
    const cmd = args[0];

    switch (cmd) {
      case '!follow':
        bot.pathfinder.setGoal(new goals.GoalFollow(player, 1), true);
        break;
      case '!stop':
        bot.pathfinder.setGoal(null);
        break;
      case '!guard':
        bot.pathfinder.setGoal(new goals.GoalBlock(player.position.x, player.position.y, player.position.z));
        break;
      case '!waypoint':
        waypoints.push(bot.entity.position.clone());
        bot.chat(`📌 Saved point #${waypoints.length}`);
        break;
      case '!goto':
        const i = parseInt(args[1]) - 1;
        if (waypoints[i]) {
          bot.pathfinder.setGoal(new goals.GoalBlock(waypoints[i].x, waypoints[i].y, waypoints[i].z));
        }
        break;
      case '!remember':
        memory[args[1]] = args.slice(2).join(' ');
        bot.chat(`🧠 Remembered ${args[1]}`);
        break;
      case '!recall':
        bot.chat(memory[args[1]] || '❌ Nothing saved under that key.');
        break;
      default:
        bot.chat("Unknown command.");
    }
  });

  // Auto-reconnect if kicked or disconnected
  bot.on('end', () => {
    console.log('Bot disconnected, reconnecting in 10 seconds...');
    setTimeout(createBot, 10000);
  });

  bot.on('error', err => {
    console.log('Bot error:', err.message);
  });
}

// === EXPRESS SERVER FOR RENDER / UPTIME ROBOT PING ===
const app = express();
app.get('/', (req, res) => res.send('Minecraft bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// Start the bot
createBot();
