#!/usr/bin/env node
const path = require("path");
const csv = require("csvtojson");
const qif = require("qif");
const pify = require("pify");
const meow = require("meow");
const fs = require("fs");
const chalk = require("chalk");
const inquirer = require("inquirer");
const fse = require("fs-extra");

(async () => {
  const ERR_NO_CSV = 1;
  const ERR_UNRECOGNISED_CONVERTER = 2;
  const ERR_FAILED_TO_WRITE_OUT = 3;

  const errorLog = (...args) => console.log(chalk.bgRed.white(...args));
  const infoLog = (...args) => console.log(chalk.blueBright(...args));
  const successLog = (...args) => console.log(chalk.greenBright(...args));

  const inDir = path.join(__dirname, "in");
  const outDir = path.join(__dirname, "out");
  const converterDir = path.join(__dirname, "converters");
  await fse.ensureDir(inDir);
  await fse.ensureDir(outDir);

  const csvPaths = (await fse.readdir(inDir)).filter(relPath =>
    relPath.endsWith(".csv")
  );

  if (!csvPaths.length) {
    errorLog(`No CSV files were found in the source directory: ${inDir}`);
    process.exit(ERR_NO_CSV);
  }

  let inRelPath = csvPaths[0];
  if (csvPaths.length > 1) {
    inRelPath = (await inquirer.prompt({
      type: "list",
      name: "in",
      message: "Select a CSV",
      choices: csvPaths
    })).in;
  }
  const inPath = path.join(inDir, inRelPath);
  const outPath = path.join(outDir, inRelPath.replace(".csv", ".qif"));

  if (await fse.pathExists(outPath)) {
    const { confirmed } = await inquirer.prompt({
      type: "confirm",
      name: "confirmed",
      message: `The output path "${outDir}" already exists. Overwrite?`
    });

    if (!confirmed) {
      infoLog("User abort.");
      process.exit();
    }
  }

  // Registering converters
  const converters = {};
  (await fse.readdir(converterDir)).forEach(relPath => {
    const converter = require(path.join(converterDir, relPath));
    const key = path.basename(relPath, ".js");
    converters[key] = converter;
  });
  const converterKeys = Object.keys(converters);
  const defaultConverterKey = converterKeys[0];

  const writeQifToFile = pify(qif.writeToFile);

  const cli = meow(
    `
      Usage
        $ ./index.js -c knh
  
      Options
        --converter, -c Converter to be used for csv import preset. (Defaults to "${defaultConverterKey}")
    `,
    {
      flags: {
        converter: {
          type: "string",
          alias: "c"
        }
      }
    }
  );

  const converterKey = cli.flags.converter || defaultConverterKey;
  const converter = converters[converterKey];
  if (!converter) {
    errorLog(
      `Unrecognised converter with key "${converterKey}". Known converters are: ${converterKeys.join(
        " "
      )}`
    );
    process.exit(ERR_UNRECOGNISED_CONVERTER);
  }

  const jsonObj = await csv({ delimiter: converter.delimiter }).fromFile(
    inPath
  );

  const cashTransactions = jsonObj.map(data => converter.convert(data));

  try {
    await writeQifToFile({ cash: cashTransactions }, outPath);

    successLog(`Saved QIF to ${outPath}`);
  } catch (error) {
    errorLog(`Failed to write QIF to ${outPath}.\n${error.stack}`);
    process.exit(ERR_FAILED_TO_WRITE_OUT);
  }
})();
