/**
   * Create By Dika Ardnt.
   * Contact Me on wa.me/6288292024190
   * Follow https://github.com/DikaArdnt
*/

const { proto, delay, getContentType } = require('@whiskeysockets/baileys')
const chalk = require('chalk')
const fs = require('fs')
const fetch = require('node-fetch')
const axios = require('axios')
const moment = require('moment-timezone')
const Jimp = require('jimp')

exports.getRandom = (ext) => {
return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.getBuffer = async (url, options) => {
try {
options ? options : {}
const res = await axios({
method: "get",
url,
headers: {
'DNT': 1,
'Upgrade-Insecure-Request': 1
},
...options,
responseType: 'arraybuffer'
})
return res.data
} catch (err) {
return err
}
}

exports.sleep = async (ms) => {
return new Promise(resolve => setTimeout(resolve, ms));
}

exports.isUrl = (url) => {
return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, 'gi'))
}

exports.getTime = (format, date) => {
if (date) {
return moment(date).locale('id').format(format)
} else {
return moment.tz('Asia/Jakarta').locale('id').format(format)
}
}

exports.json = (string) => {
return JSON.stringify(string, null, 2)
}

exports.generateProfilePicture = async (buffer) => {
const jimp = await Jimp.read(buffer)
const min = jimp.getWidth()
const max = jimp.getHeight()
const cropped = jimp.crop(0, 0, min, max)
return {
img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
}
}

exports.parseMention = (text = '') => {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}

exports.getGroupAdmins = (participants) => {
let admins = []
for (let i of participants) {
i.admin === "superadmin" ? admins.push(i.id) :  i.admin === "admin" ? admins.push(i.id) : ''
}
return admins || []
 }

exports.fetchJson = (url, options) => new Promise(async (resolve, reject) => {
fetch(url, options)
.then(response => response.json())
.then(json => {
// console.log(json)
resolve(json)
})
.catch((err) => {
reject(err)
})
})

exports.reSize = (buffer, ukur1, ukur2) => {
return new Promise(async(resolve, reject) => {
let jimp = require('jimp')
var baper = await jimp.read(buffer);
var ab = await baper.resize(ukur1, ukur2).getBufferAsync(jimp.MIME_JPEG)
resolve(ab)
})
}

exports.formatDate = (n, locale = 'id') => {
let d = new Date(n)
return d.toLocaleDateString(locale, {
weekday: 'long',
day: 'numeric',
month: 'long',
year: 'numeric',
hour: 'numeric',
minute: 'numeric',
second: 'numeric'
})
}

exports.formatSize = (bytes) => {
if (bytes >= 1000000000) { bytes = (bytes / 1000000000).toFixed(2) + " GB"; }
else if (bytes >= 1000000) { bytes = (bytes / 1000000).toFixed(2) + " MB"; }
else if (bytes >= 1000) { bytes = (bytes / 1000).toFixed(2) + " KB"; }
else if (bytes > 1) { bytes = bytes + " bytes"; }
else if (bytes == 1) { bytes = bytes + " byte"; }
else { bytes = "0 bytes"; }
return bytes;
}

exports.runtime = (seconds) => {
seconds = Number(seconds)
var d = Math.floor(seconds / (3600 * 24))
var h = Math.floor(seconds % (3600 * 24) / 3600)
var m = Math.floor(seconds % 3600 / 60)
var s = Math.floor(seconds % 60)
var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
return dDisplay + hDisplay + mDisplay + sDisplay
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.redBright(`Update ${__filename}`))
delete require.cache[file]
require(file)
})