// Note: works with Hungarian Forints. (Ex: "Ft12,000.00")
const moment = require("moment");

const delimiter = ",";

const convert = rowData => ({
  date: moment(rowData["Dátum"], "YYYY-MM-DD").format("DD/MM/YYYY"),
  amount: parseFloat(rowData["Kiadás"].replace("Ft", "").replace(",", "")),
  payee: " ",
  memo: rowData["Megjegyzés"],
  category: " "
});

module.exports = {
  delimiter,
  convert
};
