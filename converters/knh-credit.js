const moment = require("moment");

const delimiter = "\t";

const convert = rowData => {
  const date = moment(rowData["könyvelés dátuma"], "YYYY.MM.DD");
  if (!date.isValid()) {
    throw new Error(`Invalid date "${rowData["Dátum"]}"`);
  }

  return {
    date: date.format("YYYY-MM-DD"),
    amount: parseFloat(rowData["összeg"]),
    payee: rowData["partner elnevezése"] || " ",
    memo: `${rowData["típus"]} - ${rowData["könyvelési számla elnevezése"]} (${
      rowData["könyvelési számla"]
    }, ${rowData["összeg devizaneme"]}), ${rowData["közlemény"]}`,
    category: rowData["típus"] || " "
  };
};

module.exports = {
  delimiter,
  convert
};
