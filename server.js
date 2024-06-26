require("./config");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeInMemoryStore,
  jidDecode,
  proto,
  PHONENUMBER_MCC,
  getContentType,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const {
  Boom
} = require('@hapi/boom');
const axios = require("axios");
const path = require("path");
const pino = require('pino');
const readline = require("readline");
const chalk = require('chalk');
const fs = require("fs-extra");
const NodeCache = require("node-cache")
const msgRetryCounterCache = new NodeCache()

global.Func = require('./lib/myfunc.js')
global.mode = true
global.sessionName = "session";
const pairingCode = process.argv.includes("-pairing");

if (!pairingCode) {
  console.log(chalk.redBright("Use -pairing"));
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));


const store = makeInMemoryStore({
  logger: pino().child({
    level: 'silent',
    stream: 'store'
  })
});

const smsg = (conn, m, store) => {
  if (!m) return m;
  let M = proto.WebMessageInfo;
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '');
    if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || '';
  }
  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
    m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text;
    let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null;
    m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
    if (m.quoted) {
      let type = Object.keys(m.quoted)[0];
      m.quoted = m.quoted[type];
      if (['productMessage'].includes(type)) {
        type = Object.keys(m.quoted)[0];
        m.quoted = m.quoted[type];
      }
      if (typeof m.quoted === 'string') m.quoted = {
        text: m.quoted
      };
      m.quoted.mtype = type;
      m.quoted.id = m.msg.contextInfo.stanzaId;
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
      m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false;
      m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
      m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id);
      m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || '';
      m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
      m.getQuotedObj = m.getQuotedMessage = async () => {
        if (!m.quoted.id) return false;
        let q = await store.loadMessage(m.chat, m.quoted.id, conn);
        return exports.smsg(conn, q, store);
      };
      let vM = m.quoted.fakeObj = M.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id
        },
        message: quoted,
        ...(m.isGroup ? {
          participant: m.quoted.sender
        } : {})
      });
      m.quoted.delete = () => conn.sendMessage(m.quoted.chat, {
        delete: vM.key
      });
      m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options);
      m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
    }
  }
  if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg);
  m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || '';
  m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', m, {
    ...options
  }) : conn.sendText(chatId, text, m, {
    ...options
  });
  m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));
  m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options);
  conn.appenTextMessage = async (text, chatUpdate) => {
    let messages = await generateWAMessage(m.chat, {
      text: text,
      mentions: m.mentionedJid
    }, {
      userJid: conn.user.id,
      quoted: m.quoted && m.quoted.fakeObj
    });
    messages.key.fromMe = areJidsSameUser(m.sender, conn.user.id);
    messages.key.id = m.key.id;
    messages.pushName = m.pushName;
    if (m.isGroup) messages.participant = m.sender;
    let msg = {
      ...chatUpdate,
      messages: [proto.WebMessageInfo.fromObject(messages)],
      type: 'append'
    };
    conn.ev.emit('messages.upsert', msg);
  };
  return m;
};

async function startServer() {
const child = async () => {
    process.on('unhandledRejection', (err) => console.error(err))
  const { state, saveCreds } = await useMultiFileAuthState("./" + sessionName);
    const conn = makeWASocket({
      printQRInTerminal: !pairingCode,
      logger: pino({
        level: "silent",
      }),
      browser: ["Ubuntu", "Safari", "20.0.4"], 
      auth: state,
      msgRetryCounterCache,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    fireInitQueries: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    markOnlineOnConnect: true
    });
    conn.ev.on("creds.update", saveCreds)

   if (pairingCode && !conn.authState.creds.registered) {
    console.clear()
    console.log(chalk.cyan('╭──────────────────────────────────────···'));
    console.log(`📨 ${chalk.redBright('Please type your WhatsApp number')}:`);
    console.log(chalk.cyan('├──────────────────────────────────────···'));
    let phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
    console.log(chalk.cyan('╰──────────────────────────────────────···'));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
    if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
        console.log(chalk.cyan('╭─────────────────────────────────────────────────···'));
        console.log(`💬 ${chalk.redBright("Start with your country's WhatsApp code, Example 62xxx")}:`);
        console.log(chalk.cyan('╰─────────────────────────────────────────────────···'));
        console.log(chalk.cyan('╭──────────────────────────────────────···'));
        console.log(`📨 ${chalk.redBright('Please type your WhatsApp number')}:`);
        console.log(chalk.cyan('├──────────────────────────────────────···'));
        phoneNumber = await question(`   ${chalk.cyan('- Number')}: `);
        console.log(chalk.cyan('╰──────────────────────────────────────···'));
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
    }
    let code = await conn.requestPairingCode(phoneNumber)
    code = code?.match(/.{1,4}/g)?.join("-") || code
    console.log(chalk.cyan('╭──────────────────────────────────────···'));
    console.log(` 💻 ${chalk.redBright('Your Pairing Code')}:`);
    console.log(chalk.cyan('├──────────────────────────────────────···'));
    console.log(`   ${chalk.cyan('- Code')}: ${code}`);
    console.log(chalk.cyan('╰──────────────────────────────────────···'));
    rl.close()
}
    
  store.bind(conn.ev);

  conn.ev.on('messages.upsert', async chatUpdate => {
    try {
      m = chatUpdate.messages[0];
      if (!m.message) return;
      m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message;
      if (m.key && m.key.remoteJid === 'status@broadcast') return;
      if (!conn.public && !m.key.fromMe && chatUpdate.type === 'notify') return;
      if (m.key.id.startsWith('BAE5') && m.key.id.length === 16) return;
      m = smsg(conn, m, store);
      require('./client.js')(conn, m, chatUpdate, store);
    } catch (err) {
      console.log(err);
    }
  });

  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return decode.user && decode.server && decode.user + '@' + decode.server || jid;
    } else return jid;
  };

  conn.public = mode;
  conn.serializeM = (m) => smsg(sock, m, store);

  conn.ev.on('connection.update', async (update) => {
    const {
      connection,
      lastDisconnect
    } = update;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

connection === 'close' && (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? child() : console.log('connection logged out...'))
        if (connection == 'open') {
          console.log(chalk.black(chalk.bgWhite('Berhasil Terhubung....')))
        }
  });

  conn.sendText = (jid, teks, quoted = '', options) => {
    return conn.sendMessage(jid, {
      text: teks,
      ...options
    }, {
      quoted,
      ...options
    })
  };
  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      let mime = '';
      let res = await axios.head(url)
      mime = res.headers['content-type']
      
      if (mime.split("/")[1] === "gif") {
     return conn.sendMessage(jid, { 
       video: await getBuffer(url), 
       caption: caption, 
       gifPlayback: true, 
       ...options
       }, { 
       quoted: quoted, 
       ...options
       })
      }
      
      let type = mime.split("/")[0]+"Message"
      if(mime === "application/pdf") {
     return conn.sendMessage(jid, { 
       document: await getBuffer(url), 
       mimetype: 'application/pdf', 
       caption: caption, 
       ...options
       }, { 
       quoted: quoted, 
       ...options 
       })
      }
      
      if(mime.split("/")[0] === "image") {
     return conn.sendMessage(jid, { 
       image: await getBuffer(url), 
       caption: caption,
       ...options
       }, { 
       quoted: quoted, 
       ...options
       })
      }
      
      if(mime.split("/")[0] === "video") {
     return conn.sendMessage(jid, {
       video: await getBuffer(url), 
       caption: caption, 
       mimetype: 'video/mp4', 
       ...options
       }, { 
       quoted: quoted, 
       ...options 
       })
      }
      
      if(mime.split("/")[0] === "audio") {
     return conn.sendMessage(jid, { 
     audio: await getBuffer(url), 
     caption: caption, 
     mimetype: 'audio/mpeg', 
     ...options
     }, { 
     quoted: quoted, 
     ...options
      })
      }
    }
    
  conn.sendImage = async (jid, path, caption = '', quoted = '', options) => {
    let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    return await conn.sendMessage(jid, {
      image: buffer,
      caption: caption,
      jpegThumbnail: '',
      ...options
    }, {
      quoted
    });
  };

  conn.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
    let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    return await conn.sendMessage(jid, {
      video: buffer,
      caption: caption,
      gifPlayback: gif,
      jpegThumbnail: '',
      ...options
    }, {
      quoted
    });
  };

  conn.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
    let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
    return await conn.sendMessage(jid, {
      audio: buffer,
      ptt: ptt,
      ...options
    }, {
      quoted
    });
  };
  
  return conn;
    }
  child().catch((err) => console.log(err))
}


startServer();
