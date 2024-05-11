require('./config.js')
const {
BufferJSON,
WA_DEFAULT_EPHEMERAL,
generateWAMessageFromContent,
proto,
generateWAMessageContent,
generateWAMessage,
prepareWAMessageMedia,
areJidsSameUser,
getContentType
} = require('@whiskeysockets/baileys');
const { 
addNumber, 
deleteNumber, 
addMoney, 
kurangMoney 
} = require('./lib/user.js')
const fetch = require('node-fetch');
const axios = require('axios');
const md5 = require('md5');
const os = require('os');
const ms = require('parse-ms');
const fs = require("fs");
const util = require("util");
const chalk = require('chalk');
const moment = require('moment-timezone');
const { exec } = require('child_process');
const afk = JSON.parse(fs.readFileSync('./lib/database/off.json'))
const { isAfk, cekafk, addafk } = require('./lib/offline');

global.Func = require('./lib/myfunc.js')
let mode = true // Mode publik, true yang berarti public, false self
let base = 'https://vip-reseller.co.id/api/profile'
let key = 'GDeWz6grhjMrm1jZxLT0mLiYAVcp9JpN413NDUaCdP5lXEaEC4QG6GlRkyhOWh7d'
let id = 'Di9f5YY5'
let sign = md5(id + key)

module.exports = async (conn, m) => {
try {
const body = m.mtype === 'conversation' ? m.message.conversation : m.mtype === 'extendedTextMessage' ? m.message.extendedTextMessage.text : '';
const budy = typeof m.text === 'string' ? m.text : '';
const prefix = /^[#!.,®©¥€¢£/\∆✓]/.test(body) ? body.match(/^[#!.,®©¥€¢£/\∆✓]/gi) : '#' 
global.prefix
const commands = body.startsWith(prefix) ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : '';
const command = commands.replace(prefix, '');
const args = body.trim().split(/ +/).slice(1);
const detouq = (m.quoted || m)
const quoted = (detouq.mtype == 'buttonsMessage') ? detouq[Object.keys(detouq)[1]] : (detouq.mtype == 'templateMessage') ? detouq.hydratedTemplate[Object.keys(detouq.hydratedTemplate)[1]] : (detouq.mtype == 'product') ? detouq[Object.keys(detouq)[0]] : m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const qmsg = (quoted.msg || quoted)
const q = question = args.join(' ');
const message = m;
const messageType = m.mtype;
const messageKey = message.key;
const pushName = m.pushName || 'Undefined';
const itsMe = m.key.fromMe || global.ownerNumber.includes(m.sender) ? true : false
const sender = m.sender;
const userId = sender.split("@")[0];
const reply = m.reply;


const isGroup = m.key.remoteJid.endsWith('@g.us') 
const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(e => {}) : ''
const groupName = m.isGroup ? groupMetadata.subject : ''
const participants = m.isGroup ? await groupMetadata.participants : ''
const groupAdmins = m.isGroup ? await Func.getGroupAdmins(participants) : ''
const isBotAdmins = m.isGroup ? groupAdmins.includes(itsMe) : false
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
const groupOwner = m.isGroup ? groupMetadata.owner : ''
const isGroupOwner = m.isGroup ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender) : false
const groupMembers = m.isGroup ? groupMetadata.participants : ''

async function newReply(teks) {
const po = {
contextInfo: {
mentionedJid: [m.sender],
externalAdReply: {
showAdAttribution: true,
title: 'Aerial - AI',
body: time,
previewType: "PHOTO",
thumbnail: global.thumb,
sourceUrl: global.link
}
},
text: teks
};
return conn.sendMessage(m.chat, po, {
quoted: m
});
};

async function reaction(emoji) {
const reactionMessage = {
react: {
text: emoji, // use an empty string to remove the reaction
key: message.key
}
}
conn.sendMessage(m.chat, reactionMessage)
}

moment.tz.setDefault("Asia/Makassar").locale("id")
const time = moment.tz('Asia/Makassar').format('HH:mm:ss')
const waktu = moment().tz('Asia/Makassar').format('HH:mm:ss')
if (waktu < "23:59:00") {
 var ucapanWaktu = 'Selamat Malam 🏙️'
}
if (waktu < "19:00:00") {
 var ucapanWaktu = 'Selamat Petang 🌆'
}
if (waktu < "18:00:00") {
 var ucapanWaktu = 'Selamat Sore 🌇'
}
if (waktu < "15:00:00") {
 var ucapanWaktu = 'Selamat Siang 🌤️'
}
if (waktu < "10:00:00") {
 var ucapanWaktu = 'Selamat Pagi 🌄'
}
if (waktu < "05:00:00") {
 var ucapanWaktu = 'Selamat Subuh 🌆'
}
if (waktu < "03:00:00") {
 var ucapanWaktu = 'Selamat Malam 🌃'
}

const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

const ftextt = {
 key: {
fromMe: false, 
participant: `0@s.whatsapp.net`, 
...(m.chat ? { 
remoteJid: "status@broadcast" 
} : {})}, 
message: { "extendedTextMessage": {
"text":`*Assistant - Aerial*`, 
"title": `${ucapanWaktu}`, 
'jpegThumbnail': await Func.reSize('./media/menu.jpg', 100, 100)}
}
 }

if (body.startsWith('$')) {
if (!itsMe) return 
exec(q, async (err, stdout) => {
if (err) return m.reply(`${err}`)
if (stdout) {
await m.reply(`${stdout}`)
}
})
}

if (body.startsWith('>')) {
if (!itsMe) return 
try {
let evaled = await eval(q)
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await m.reply(evaled)
} catch (err) {
await m.reply(String(err))
}
}

if (body.startsWith('=>')) {
if (!itsMe) return 
function Return(sul) {
let sat = JSON.stringify(sul, null, 2)
if (sat) {
var bang = util.format(sat)
} else if (sat == undefined) {
var bang = util.format(sul)
}
return m.reply(bang)
}
try {
m.reply(util.format(eval(`(async () => { return ${q} })()`)))
} catch (e) {
m.reply(String(e))
}
}

cekafk(afk)
if (!m.key.remoteJid.endsWith('@g.us') && global.offline){
if (!m.key.fromMe){
if (isAfk(m.key.remoteJid)) return
addafk(m.key.remoteJid)
heheh = ms(Date.now() - global.waktuu) 
let tkss = global.teks
m.reply(tkss)
}
}
if (m.key.remoteJid.endsWith('@g.us') && global.offline) {
if (!m.key.fromMe){
if (m.message.extendedTextMessage != undefined){
if (m.message.extendedTextMessage.contextInfo != undefined){
if (m.message.extendedTextMessage.contextInfo.mentionedJid != undefined){
for (let ment of m.message.extendedTextMessage.contextInfo.mentionedJid) {
if (ment === `${ownerNumber}@s.whatsapp.net`){
if (isAfk(m.key.remoteJid)) return
addafk(m.key.remoteJid)
heheh = ms(Date.now() - global.waktuu)
let tkss = global.teks
m.reply(tkss)
}
}
}
}
}
}
}

//Mode Public/Self
if (!mode) {
if (!m.key.fromMe) return;
}

//Reader Messages 
if (m.message) {
//conn.readMessages([m.key]);

//Reader Console Command 
console.log('====================')
console.log(chalk.black(chalk.bgWhite(!command ? '|| CHAT ||' : '|| CMD ||')), chalk.black(chalk.bgGreen(time)) + ' >', chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('=> From'), chalk.green(pushName), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=> In'), chalk.green(m.isGroup ? groupName : 'Private Chat', m.chat))
}

if (!body.startsWith(prefix)) {
return;
}

switch (command) {

case 'menu': {
if (!itsMe) return
let teks = `Hi ${pushName || 'Kak!'} ${ucapanWaktu}

乂 *INFORMATION*
◦ Creator: @6285796158860
◦ Time: ${time}
${readmore}
乂 *OWNER MENU*
 ${prefix}tes
 ${prefix}get
 ${prefix}status

乂 *MAIN MENU*
 ${prefix}online
 ${prefix}offline
 ${prefix}fetch

乂 *AI MENU*
 ${prefix}ai

乂 *DL MENU*
 ${prefix}tiktok

乂 *GC MENU*
 ${prefix}hdtag

乂 *SHOP MENU*
 ${prefix}cekacc
 ${prefix}order
 ${prefix}prepaid
 ${prefix}pulsa-status
 ${prefix}game-status
 ${prefix}cek
`
conn.sendMessage(m.chat, { text: teks, 
contextInfo: { externalAdReply: {
title: "Aerial - AI",
body: ucapanWaktu,
sourceUrl: "",
mediaUrl: "",
mediaType: 1,
showAdAttribution: true,
renderLargerThumbnail: true,
thumbnailUrl: "https://telegra.ph/file/955c9b7387159b4886b4a.jpg", 
mentions: ['6285796158860@s.whatsapp.net']}}}, { quoted: ftextt })
 }
 break;

case 'cekacc': {
if (!itsMe) return

let payload = {
key: key,
sign: sign
}

axios(base, {
method: 'POST',
data: new URLSearchParams(Object.entries(payload)) // Directly use the payload object
})
.then(data => {
newReply(`${Func.json(data.data)}`) // Access the actual data from the response
})
}
break
case 'order': {
if (!q) return m.reply("Contoh penggunaan:\n\n " +prefix+ "order nama game|id produk|id") 
let t1 = q.split("|")[0]
let t2 = q.split("|")[1]
let t3 = q.split("|")[2]
let t4 = q.split("|")[3]

if(t1 == "mobile-legends" && !t4) return m.reply("Untuk Mobile-Legends harap sertakan zoneId!\n ▪︎ Contoh: " +prefix+ "order id produk|id|zoneId")

const postData = {
  key: key, 
  sign: sign, 
  type: 'order', 
  service: t2,
  data_no: t3,
  data_id: t4
}

axios("https://vip-reseller.co.id/api/game-feature", {
method: 'POST',
data: new URLSearchParams(Object.entries(postData)) // Directly use the payload object
})
.then(data => {
newReply(`${Func.json(data.data)}`) // Access the actual data from the response
})
}
break
case 'prepaid': {
if (!q) return m.reply("Example: " +prefix+ "prepaid ID Product|Tujuan")
let t1 = q.split("|")[0]
let t2 = q.split("|")[1]

const sendData = {
key: key,
sign: sign,
type: 'order',
service: t1,
data_no: t2
}

axios("https://vip-reseller.co.id/api/prepaid", {
method: 'POST',
data: new URLSearchParams(Object.entries(sendData))
})
.then(data => {
newReply(`${Func.json(data.data)}`)
})
}
break

case 'pulsa-status': {
if (!q) return m.reply("Contoh Penggunaan :\n\n " +prefix+ "status Limit")
let t1 = q.split("|")[0]

const postData1 = {
key: key,
sign: sign,
type: 'status',
trxid: '',
limit: t2
}

axios("https://vip-reseller.co.id/api/prepaid", {
method: 'POST',
data: new URLSearchParams(Object.entries(postData1)) // Directly use the payload object
})
.then(data => {
newReply(`${Func.json(data.data)}`) // Access the actual data from the response
})
}
break
case 'game-status': {
if (!q) return m.reply("Contoh Penggunaan :\n\n " +prefix+ "status Limit")
let t1 = q.split("|")[0]

const postData2 = {
key: key,
sign: sign,
type: 'status',
trxid: '',
limit: t2
}

axios("https://vip-reseller.co.id/api/game-feature", {
method: 'POST',
data: new URLSearchParams(Object.entries(postData2)) // Directly use the payload object
})
.then(data => {
newReply(`${Func.json(data.data)}`) // Access the actual data from the response
})
}
break
case 'cek': {
  if (!itsMe) return
  if (!q) return newReply(mess.query)

  const validQueries = ['FF', 'FF MAX', 'ML', "Pulsa Telkom", "Pulsa XL", "DANA", "GOPAY"]
  if (!validQueries.includes(q)) return newReply("Daftar harga Digital Product yang bisa di cek yaitu:\n`</> GAME </>`\n> FF\n> FF MAX\n> ML\n\n`</> PULSA </>`\n> Pulsa Telkom\n> Pulsa XL\n\n`</> E-MONEY </>`\n> DANA\n> GOPAY\n\nContoh: #cek ML")

  try {
    const data = fs.readFileSync('./lib/database/daftar-harga.json', 'utf8') 
    const prices = JSON.parse(data) 

    switch (q) {
      case 'FF':
        const ffMessage = `*Daftar Harga Diamond Free Fire*\nID PRODUCT | PRODUCT | HARGA\n\n${Object.entries(prices.epep).map(([key, value]) => `* ${key}: Rp ${value}`).join('\n')}`
        newReply(ffMessage)
        break
      case 'FF MAX':
        const ffMaxMessage = `*Daftar Harga Diamond Free Fire Max*\nID PRODUCT | PRODUCT | HARGA\n\n${Object.entries(prices.epepmax).map(([key, value]) => `* ${key}: Rp ${value}`).join('\n')}`
        newReply(ffMaxMessage)
        break
      case 'ML':
        const mlMessage = `*Daftar Harga Diamond Mobile Legends*\nID PRODUCT | PRODUCT | HARGA\n\n${Object.entries(prices.mlbb).map(([key, value]) => `* ${key}: Rp ${value}`).join('\n')}`
        newReply(mlMessage)
        break
      case 'Pulsa Telkom':
        const telkom = `*Daftar Harga Pulsa Telkomsel*\nID PRODUCT | PRODUCT | HARGA\n\n${Object.entries(prices.mlbb).map(([key, value]) => `* ${key}: Rp ${value}`).join('\n')}`
        newReply(telkom)
        break
      case 'Pulsa XL':
        const exel = `*Daftar Harga Pulsa XL*\nID PRODUCT | PRODUCT | HARGA\n\n${Object.entries(prices.mlbb).map(([key, value]) => `* ${key}: Rp ${value}`).join('\n')}`
        newReply(exel)
        break
      case 'DANA':
        const dana = `*Daftar Harga E-Money Dana*\nID PRODUCT | PRODUCT | HARGA\n\n${Object.entries(prices.dana).map(([key, value]) => `* ${key}: Rp ${value}`).join('\n')}`
        newReply(dana)
        break
      case 'GOPAY':
        const gopay = `*Daftar Harga E-Money Go-Pay*\nID PRODUCT | PRODUCT | HARGA\n\n${Object.entries(prices.gopay ).map(([key, value]) => `* ${key}: Rp ${value}`).join('\n')}`
        newReply(gopay)
        break
    }
  } catch (error) {
    console.error('Error reading daftar-harga.json:', error)
    newReply('Maaf, terjadi kesalahan saat mengambil harga.')
  }
}
break



case 'status': {
if (!itsMe) return
m.reply(`乂 *STATUS - SERVER*

» Hostname: ${os.hostname()}
» Platform: ${os.platform()}
» Type: ${os.type}
» OS: ${os.version()}/${os.release()}
» Arch: ${os.arch()}
» RAM: ${Func.formatSize(os.freemem())} / ${Func.formatSize(os.totalmem())}

» Uptime OS
  ${Func.runtime(os.uptime())}

» Runtime Bot
  ${Func.runtime(process.uptime())}
`)
}
break
case 'get': {
if (!itsMe) return
if (!q) return newReply(mess.query)
if (!isUrl) return newReply('Enter the link where you want to download the media...')
conn.sendFileUrl(m.chat, q)
}
break
case 'fetch': {
if (!itsMe) return;
if (!isUrl(args[0]) && !args[0].includes('https://')) return reply('Invalid!')
fetch(q).then(res => res.text())
.then(bu => {
m.reply(bu);
});
}
break;

case 'hdtag':{
if (!itsMe) return
let mem = []
groupMembers.map( i => mem.push(i.id))
conn.sendMessage(m.chat, { text: q ? q : '', mentions: mem})
}
break
case 'offline':{
if (!itsMe) return
global.offline = true
newReply('Bot is now debuging...')
}
break
case 'online':{
if (!itsMe) return
global.offline = false
newReply('Debug is turned off!')
}
break
case 'tes': {
if (!itsMe) return
newReply('The bot has run...');
}
break;
case 'tiktok': case 'ttnowm': case 'tiktoknowm': case 'tt': {
if (!itsMe) return
if (!q) return newReply(mess.query)
if (!isUrl(q)) return newReply('URL invalid!')
reaction('⏳')
Func.fetchJson(global.webkey + 'api/downloader/snaptik?url=' + q + `&apiKey=` + global.apikey).then( data => {
conn.sendMessage(m.chat, { video: { url: data.result.server1.url }, caption: data.result.caption }, { quoted: m })
})
}
break;
case 'ai':
if (!itsMe) return
try {
if (!q) return reply('Question?')
reaction('⏳')
Func.fetchJson(global.webkey + `api/ai/gemini?query=` + q + `&apiKey=` + global.apikey).then( data => {
conn.sendMessage(m.chat, { text: data.result }, { quoted: m }) 
})
} catch(e) {
m.reply(mess.error)
}
break;
case "backup": {
          if (!itsMe) return
          try {
          newReply("Waiting...")
          const { execSync } = require("child_process");
          const ls = (await execSync("ls"))
            .toString()
            .split("\n")
            .filter(
              (pe) =>
                pe != "node_modules" &&
                pe != "session" &&
                pe != "package-lock.json" &&
                pe != "yarn.lock" &&
                pe != ""
            );
          const exec = await execSync(`zip -r New.zip ${ls.join(" ")}`);
          await conn.sendMessage(
            m.chat,
            {
              document: await fs.readFileSync("./New.zip"),
              mimetype: "application/zip",
              fileName: "New.zip",
            },
            { quoted: m }
          );
          await execSync("rm -rf New.zip");
          } catch(e) {
            m.reply(mess.error)
          }
        }
        break
        
default: {}
}

} catch (err) {
console.log(util.format(err));
}
}


let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.redBright(`Update ${__filename}`));
delete require.cache[file];
require(file);
});
