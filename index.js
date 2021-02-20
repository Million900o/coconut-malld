const path = require('path')
const PATH = path.resolve(__dirname, 'coconut-mall.mp3')
const TIME = 74 * 60 * 1000

// real important shit, ya know?
const fs = require('fs')
if (!fs.existsSync(PATH)) {
  const ytdl = require('ytdl-core')
  ytdl('https://www.youtube.com/watch?v=9FLnJWf6Uns', { filter: 'audioandvideo', quality: 'highestaudio' })
    .pipe(fs.createWriteStream(PATH))
}

// Imports
const Discord = require('discord.js-light')
const colors = require('colors/safe')
const config = require('./config.json')

// Creating the client
// I don't care about most shit so I have small intents
const client = new Discord.Client({
  cacheChannels: true,
  partials: ['GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER'],
  ws: {
    intents: 641,
    properties: { $browser: 'Discord iOS' }
  }
})

// Date function for logs
function getDate () {
  const date = new Date()
  return colors.cyan(`${date.toLocaleTimeString()} : ${date.toLocaleDateString()}`)
}

// Format the logs nicely
function log (...args) {
  const msg = args.map(arg => colors.bold(arg))
  console.log(getDate(), '|', ...msg)
}

// Fancy, right?
client.on('ready', () => {
  log(`Ready as ${client.user.tag} (${client.user.id})`)
})

function runShit () {
  // Get all channels
  // Rules:
  //  * No channels can be of the same guild
  //  * They need to have users
  const channels = Array.from(client.channels.cache).filter(e => e[1].type === 'voice').map(e => e[1]).reduce((a, channel) => {
    if (!a.find(e => e.guild.id === channel.guild.id) && channel.members.size > 0 && channel.members.reduce((ac, member) => {
      if (member.user.bot) return ac
      ac.push(member)
      return ac
    }, []).length > 0) a.push(channel)
    return a
  }, [])
  // What the fuck did I just do? ^

  // :sad:
  if (channels.length === 0) return log(colors.red('sad boi hours'))

  // Loop through all channels like a boss
  for (const channel of channels) {
    // Join the channel and play it
    channel.join().then(connection => {
      const dispatcher = connection.play(PATH, { volume: 0.3 })

      // Success!!!!!
      log(colors.green(`Coconut mall'd ${channel.guild.id}`))

      // When it finishes
      dispatcher.on('finish', () => {
        channel.leave()
      })

      // Disconnect on done
      dispatcher.on('disconnect', () => {
        dispatcher.destroy()
      })

      // Idk some errors ig
      dispatcher.on('error', (e) => {
        channel.leave()
        log(colors.red(e.toString()))
      })
    })
  }
}

setInterval(runShit, TIME)

// The one command I have because useful
client.on('message', (msg) => {
  if (msg.author.bot) return
  if (msg.content === 'force') runShit()
})

// Make sure im not getting shit events that I don't need
client.on('raw', (raw) => {
  if (raw.t && !['READY', 'GUILD_CREATE', 'MESSAGE_CREATE', 'VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(raw.t)) { log(colors.red(raw.t)) }
})

// Login
client.login(config.token)
