const puppeteer = require("puppeteer");
const { CURRENCY_PAIRS } = require("./input/currency-pairs.json");
const { fxPageUrl, fxOutputSelector } = require("./settings.json");
const converter = require("json-2-csv");
const fs = require("fs");

(async () => {
  console.log("FX Puppet opened");

  const output = [];

  for (let i = 0, len = CURRENCY_PAIRS.length; i < len; i++) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const { src, dst } = CURRENCY_PAIRS[i];
    const puppetOptions = {
      waitUntil: "networkidle2",
    };

    await page.goto(
      `${fxPageUrl}?from=${src}&to=${dst}&amount=1`,
      puppetOptions
    );

    const pairOutput = await page.evaluate((fxOutputSelector) => {
      const outputBox = document.querySelector(fxOutputSelector);

      return outputBox.value;
    }, fxOutputSelector);

    output.push({
      src,
      srcValue: 1,
      dst,
      dstValue: pairOutput,
    });
    console.log(`1 ${src} -> ${pairOutput} ${dst}`);

    await browser.close();
  }

  // Write to file
  const writeToFile = (err, csv) => {
    if (err) {
      throw err;
    }

    fs.writeFileSync("./output/fx.csv", csv, "utf8");
  };
  converter.json2csv(output, writeToFile, { prependHeader: true });

  console.log("FX Puppet Completed");
})();
