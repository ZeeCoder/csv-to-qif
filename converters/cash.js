const moment = require("moment");

const delimiter = ",";

const convert = rowData => ({
  date: moment(rowData["Dátum"], "YYYY-MM-DD").format("DD/MM/YYYY"),
  amount: parseFloat(rowData["Kiadás"].replace("Ft", "")),
  payee: " ",
  memo: rowData["Megjegyzés"],
  category: " "
});

module.exports = {
  delimiter,
  convert
};
