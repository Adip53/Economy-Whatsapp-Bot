const { create, adip, Client } = require('@open-wa/wa-automate');

//install this package
const db = require("quick.db")
const fs = require("fs")

//config
const config = require('./config.json')
const prefix = config.prefix
const ownerNumber = config.owner
const premi = config.premi

//level file
const xpfile = require('./db/level.json')

//database

//mesage
const regis = 'Kamu Telah Register'
const notregis = 'Kamu Belum Register Silahkan Ketik /register Untuk Register Akun Anda'

function start(adip) {
  console.clear()
  console.log('[DEV] Adip')
  console.log('[CLIENT]] ADZ BOT V2 ONLINE!')
  console.log('[LOADED]config.json Loaded', config)
  console.log('=====================================')

  //info state
  adip.onStateChanged((state) => {
    console.log('[STATE]', state)
    if (state === 'CONFLICT' || state === 'DISCONNECTED' || state === 'CONNECT') adip.forceRefocus()
  })

  adip.onMessage(async message => {
    //function
    const { type, id, from, t, author, content, argv, sender, isGroupMsg, chat, chats, chatId, caption, isMedia, isGif, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
    let { body } = message
    body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
    const args = body.trim().split(/ +/).slice(1)
    const { name, formattedTitle } = chat
    let { pushname, verifiedName, formattedName } = sender
    pushname = pushname || verifiedName || formattedName
    const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
    const isCmd = body.startsWith(prefix)
    const botNumber = adip.getHostNumber() + '@c.us'
    const isOwnerBot = ownerNumber.includes(sender.id)
    const pengirim = sender.id
    const isPremi = premi.includes(sender.id)
    //logs chat & cmd
    if (!isCmd && !isGroupMsg) {
      console.log(`[CHAT]@${pushname} Message In Dm:${message.body}`)
    }
    if (!isCmd && isGroupMsg) {
      console.log(`[CHAT]@${pushname} In Group ${name || formattedTitle}:${message.body}`)
    }
    if (isCmd && !isGroupMsg) {
      console.log(`[CHAT]@${pushname} Message In Dm:${message.body}`)
    }
    if (isCmd && isGroupMsg) {
      console.log(`[CMD]@${pushname} In Group ${name || formattedTitle}:${message.body}`)
    }
    //level system with json
    var addXP = Math.floor(Math.random() * 8) + 3;
    
       if(!xpfile[sender.id]){
          xpfile[sender.id] = {
             xp: 0,
             level: 1,
             reqxp: 1000
          }
    
          fs.writeFile("./db/level.json", JSON.stringify(xpfile), function(err){
             if(err) console.log(err)
          })
       }
    
       xpfile[sender.id].xp += addXP
    
       if(xpfile[sender.id].xp > xpfile[sender.id].reqxp){
          xpfile[sender.id].xp -= xpfile[sender.id].reqxp
          xpfile[sender.id].reqxp *= 1.5
          xpfile[sender.id].reqxp = Math.floor(xpfile[sender.id].reqxp)
          xpfile[sender.id].level += 1
    
          adip.reply(from, "Is now Level *"+xpfile[sender.id].level+"*!", id)
       }
    
       fs.writeFile("./db/level.json", JSON.stringify(xpfile), function(err){
          if(err) console.log(err)
       })
    //auto read
    adip.sendSeen(from)
    //economy database
    let uang = db.fetch(`money_${sender.id}`)
    if (uang === null) uang = 0;
    //cut msg
    adip.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && adip.cutMsgCache())
    //mengetik
    adip.simulateTyping(from, true)
    //command
    if (command === 'bal') {
      adip.reply(from, `*Keuangaan Anda*\n\nUang:${uang}`, id)
    }
    if (command === 'info') {
      let userInfo = xpfile[sender.id];
      adip.reply(from, `Level:${userInfo.level}\nXp:${userInfo.xp}/${userInfo.reqxp}`, id)
    }

  });
}

//session
const options = {
  sessionId: 'Adip',
  headless: true,
  qrTimeout: 0,
  authTimeout: 0,
  restartOnCrash: start,
  cacheEnabled: false,
  useChrome: true,
  killProcessOnBrowserClose: true,
  throwErrorOnTosBlock: false,
  chromiumArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0'
  ]
}
create(options)
  .then((adip) => start(adip))
  .catch((err) => new Error(err))