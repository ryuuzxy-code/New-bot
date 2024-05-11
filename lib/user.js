const fs = require('fs');

const DB_User = JSON.parse(fs.readFileSync('./lib/database/DB_User.json'));

exports.addNumber = (nomor, saldo) => {
  if (DB_User[nomor]) {
    throw new Error(`Nomor ${nomor} sudah ada di database`);
  }

  DB_User[nomor] = saldo;
  fs.writeFileSync('./lib/database/DB_User.json', JSON.stringify(DB_User));
  return `Nomor ${nomor} berhasil ditambahkan dengan saldo ${saldo}`;
};

exports.deleteNumber = (nomor) => {
  if (!DB_User[nomor]) {
    throw new Error(`Nomor ${nomor} tidak ditemukan di database`);
  }
  delete DB_User[nomor];
  fs.writeFileSync('./lib/database/DB_User.json', JSON.stringify(DB_User));
  return `Nomor ${nomor} berhasil dihapus`;
};

exports.addMoney = (nomor, jumlah) => {
  if (!DB_User[nomor]) {
    throw new Error(`Nomor ${nomor} tidak ditemukan di database`);
  }
  DB_User[nomor] += jumlah;
  fs.writeFileSync('./lib/database/DB_User.json', JSON.stringify(DB_User));
  return `Saldo nomor ${nomor} berhasil ditambahkan sebesar ${jumlah}`;
};

exports.kurangMoney = (nomor, jumlah) => {
  if (!DB_User[nomor]) {
    throw new Error(`Nomor ${nomor} tidak ditemukan di database`);
  }

  if (DB_User[nomor] < jumlah) {
    throw new Error(`Saldo nomor ${nomor} tidak mencukupi`);
  }

  DB_User[nomor] -= jumlah;
  fs.writeFileSync('./lib/database/DB_User.json', JSON.stringify(DB_User));
  return `Saldo nomor ${nomor} berhasil dikurangi sebesar ${jumlah}`;
};
