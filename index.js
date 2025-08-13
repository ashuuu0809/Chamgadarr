// minecraft.js — AN ANTI-AFK+ANTI-BAN AUTOMATED BOT BY ARSH

const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const autoeat = require('mineflayer-auto-eat');
const collectBlock = require('mineflayer-collectblock').plugin;
const pvp = require('mineflayer-pvp').plugin;
const tool = require('mineflayer-tool').plugin;
const armorManager = require('mineflayer-armor-manager').plugin;
const { Vec3 } = require('vec3');

function createBot() {
  const bot = mineflayer.createBot({
    host: 'Wbrother2nios.aternos.me',
    port: 26555,
    username: 'Rakshan2022',
    version: false
  });

  bot.loadPlugin(pathfinder);
  if (typeof autoeat === 'function') bot.loadPlugin(autoeat);
  if (typeof collectBlock === 'function') bot.loadPlugin(collectBlock);
  if (typeof pvp === 'function') bot.loadPlugin(pvp);
  if (typeof tool === 'function') bot.loadPlugin(tool);
  if (typeof armorManager === 'function') bot.loadPlugin(armorManager);

  let waypoints = [];
  let memory = {};

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version);
    const defaultMove = new Movements(bot, mcData);
    bot.pathfinder.setMovements(defaultMove);

    if (bot.autoEat) {
      bot.autoEat.options = {
        priority: 'foodPoints',
        startAt: 18,
        bannedFood: []
      };
      bot.autoEat.enable();
    }

    bot.setControlState('jump', true);
    bot.setControlState('forward', true);

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
  });

  bot.on('autoeat_started', () => console.log('🍗 Eating...'));
  bot.on('autoeat_finished', () => console.log('✅ Done eating.'));
  bot.on('health', () => {
    if (bot.food < 18 && bot.autoEat) bot.autoEat.enable();
    else if (bot.autoEat) bot.autoEat.disable();
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
        if (bot.pvp) bot.pvp.stop();
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
}

createBot();
