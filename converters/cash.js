// Note: works with Hungarian Forints. (Ex: "Ft12,000.00")
const moment = require("moment");

const delimiter = ",";

const convert = rowData => {
  const date = moment(rowData["Dátum"], "YYYY-MM-DD");
  if (!date.isValid()) {
    throw new Error(`Invalid date "${rowData["Dátum"]}"`);
  }

  return {
    date: date.format("YYYY-MM-DD"),
    amount: parseFloat(rowData["Kiadás"].replace("Ft", "").replace(/,/g, "")),
    payee: " ",
    memo: rowData["Megjegyzés"],
    category: " "
  };
};

module.exports = {
  delimiter,
  convert
};
