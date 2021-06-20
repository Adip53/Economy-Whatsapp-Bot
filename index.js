const { create, adip, Client } = require('@open-wa/wa-automate');

//install this package
const db = require("quick.db")
const fs = require("fs")

//config
const config = require('./config.json')
const prefix = config.prefix
const ownerNumber = config.owner
const premi = config.premi

//database
const xpfile = require('./db/level.json')
const regis = JSON.parse(fs.readFileSync('./db/nomor.json'))
const users = require('./db/user.json')

//mesage
const yregis = 'Kamu Telah Register'
const notregis = 'Kamu Belum Register Silahkan Ketik /register Nama Untuk Register Akun Anda'
const kosong = 'Text Kosong'

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
    const isRegis = regis.includes(sender.id)

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
             reqxp: 1000,
             lbk: 1000
          }
    
          fs.writeFile("./db/level.json", JSON.stringify(xpfile), function(err){
             if(err) console.log(err)
          })
       }
    
       xpfile[sender.id].xp += addXP
    
       if(xpfile[sender.id].xp > xpfile[sender.id].reqxp){
          xpfile[sender.id].xp -= xpfile[sender.id].reqxp
          xpfile[sender.id].reqxp *= 1.5
          xpfile[sender.id].lbk *= 3.5
          xpfile[sender.id].reqxp = Math.floor(xpfile[sender.id].reqxp)
          xpfile[sender.id].lbk = Math.floor(xpfile[sender.id].lbk)
          xpfile[sender.id].level += 1
    
          adip.sendTextWithMentions(from, `*Is @${sender.id} now Level ${xpfile[sender.id].level}*`)
       }
    
       fs.writeFile("./db/level.json", JSON.stringify(xpfile), function(err){
          if(err) console.log(err)
       })
    //connect level to all
    let userInfo = xpfile[sender.id]; // get level, limit bank, xp, reqxp
    let user = users[sender.id]; //get name kayak discord user.np
    //auto read
    adip.sendSeen(from)
    //economy database
    let uang = db.fetch(`money_${sender.id}`)
    if (uang === null) uang = 0;
    let bank = db.fetch(`bank_${sender.id}`)
    if (bank === null) bank = 0;
    //cut msg
    adip.getAmountOfLoadedMessages().then((msg) => (msg >= 3000) && adip.cutMsgCache())
    //args
    const a = args.join(' ')
    //message bot
    if (message.body === "adip") {
      adip.reply(from, `Ya Ada Apa?`, id)
    }
    //command
    if (command === 'bal') {
      if (!isRegis) return adip.reply(from, notregis, id)
      adip.reply(from, `*>${user.np}< Balance*\n\n*Uang:${uang.toLocaleString()}*\n*Bank:${bank.toLocaleString()}/${userInfo.lbk.toLocaleString()}*`, id)
    }
    if (command === 'addme') {
      if (!isOwnerBot) return adip.reply(from, 'Eits Mau Ngapain? Only Owner Bot', id)
      db.add(`money_${sender.id}`, a)
      adip.reply(from, `Berhasil Menanmbahkan Uang Sebanyak ${a.toLocaleString()}`, id)
    }
    /*if (command === 'dep') {
      if (a > uang) return adip.reply(from, 'Uang Tidak Cukup', id)
      if (bank == userInfo.lbk) return adip.reply(from, 'Bank Kamu Telah Penuh', id)
      if (a === 'all') {
        if (bank == 1000) return adip.reply(from, 'Bank Kamu Telah Penuh', id)
        db.add(`bank_${sender.id}`, uang)
        db.subtract(`money_${sender.id}`, uang)
      } else {
        db.add(`bank_${sender.id}`, a)
        db.subtract(`money_${sender.id}`, a)
      }
    }*/ //masi ngebug tunggu update selanjut nya
    if (command === 'info') {
      if (!isRegis) return adip.reply(from, notregis, id)
      adip.reply(from, `Level:${userInfo.level}\nXp:${userInfo.xp}/${userInfo.reqxp}`, id)
    }
    if (command === 'register') {
      if (isRegis) return adip.reply(from, yregis, id)
      let tag = Math.floor(Math.random() * 1000)
      const nama = args.join(' ')
      if (!nama) return adip.reply(from, 'Isi Namanya\nContoh:/register Adip', id)
      if(!users[sender.id]){
        users[sender.id] = {
           np: `${nama}#${tag}`
        }
  
        fs.writeFile("./db/user.json", JSON.stringify(users), function(err){
           if(err) console.log(err)
        })
     }
      regis.push(sender.id)
      fs.writeFileSync('./db/nomor.json', JSON.stringify(regis))
      adip.reply(from, `Berhasil Daftar\nNama: *${nama}#${tag}*`, id)
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
