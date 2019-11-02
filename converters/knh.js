const moment = require("moment");

const convert = rowData => ({
  date: moment(rowData["könyvelés dátuma"], "YYYY.MM.DD").format("DD/MM/YYYY"),
  amount: parseFloat(rowData["összeg"]),
  payee: rowData["partner elnevezése"],
  memo: [
    `könyvelési számla elnevezése: ${rowData["könyvelési számla elnevezése"]}`,
    `könyvelési számla: ${rowData["könyvelési számla"]}`,
    `összeg devizaneme: ${rowData["összeg devizaneme"]}`
  ].join(";"),
  category: rowData["típus"]
});

module.exports = { convert };
