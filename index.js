#!/usr/bin/env node
const path = require("path");
const csv = require("csvtojson");
const qif = require("qif");
const pify = require("pify");
const moment = require("moment");
const meow = require("meow");

const writeQifToFile = pify(qif.writeToFile);

(async () => {
  const cli = meow(
    `
      Usage
        $ ./index.js --bank=knh
  
      Options
        --bank, -b  Bank type to be used for csv import preset.
    `,
    {
      flags: {
        bank: {
          type: "string",
          alias: "b"
        }
      }
    }
  );

  const banks = ["knh", "hsbc"];

  let bank = cli.flags.bank || "knh";
  if (!banks.includes(bank)) {
    bank = "knh";
  }

  const jsonObj = await csv({ delimiter: "\t" }).fromFile(
    path.join(__dirname, "in.csv")
  );

  const cashTransactions = jsonObj.map(data => ({
    date: moment(data["könyvelés dátuma"], "YYYY.MM.DD").format("DD/MM/YYYY"),
    amount: parseFloat(data["összeg"]),
    payee: data["partner elnevezése"],
    memo: [
      `könyvelési számla elnevezése: ${data["könyvelési számla elnevezése"]}`,
      `könyvelési számla: ${data["könyvelési számla"]}`,
      `összeg devizaneme: ${data["összeg devizaneme"]}`
    ].join(";"),
    category: data["típus"]
  }));

  await writeQifToFile(
    { cash: cashTransactions },
    path.join(__dirname, "./out.qif")
  );
})();
