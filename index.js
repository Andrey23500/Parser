const puppeteer = require('puppeteer');
const fs = require("fs");

const url = process.argv[2];
const REGION = process.argv[3];
const FILE_PATH = `${REGION}/product.txt`;

(async () => {
   const browser = await puppeteer.launch({ headless: 'shell' });
   try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.setViewport({ width: 1280, height: 1024 });

      // REGIONS
      // await page.waitForSelector('div[class*="Region_region"]');
      // await page.click('div[class*="Region_region"]')
      // await page.waitForNavigation()
      // await page.waitForSelector('[class*="Modal_root"]');
      // const regions = await page.evaluate(() => Array.from(document.querySelectorAll('[class*="UiRegionListBase_item"]'), element => element.textContent));
      // for (let reg of regions) {
      //    const regionText = await page.evaluate(el => el.textContent, reg);
      //    if (regionText.includes(REGION)) {
      //       await reg.click();
      //       break;
      //    }
      // }

      // COSTS
      if (!fs.existsSync(REGION)) fs.mkdirSync(REGION);
      const price = await page.waitForSelector('[class*="PriceInfo_root"] > [class*="Price_price"]');
      const priceValue = await price.evaluate(el => el.textContent);
      fs.appendFileSync(FILE_PATH, forematted("price", priceValue));

      if (await page.$('[class*="PriceInfo_root"] [class*="PriceInfo_oldPrice"] [class*="Price_price"]')) {
         const priceOld = await page.waitForSelector('[class*="PriceInfo_root"] [class*="PriceInfo_oldPrice"] [class*="Price_price"]');
         const priceOldValue = await priceOld.evaluate(el => el.textContent);
         fs.appendFileSync(FILE_PATH, forematted("priceOld", priceOldValue));
      }

      const raiting = await page.waitForSelector('[class*="ActionsRow_root"] [class*="ActionsRow_reviewsWrapper"] a[class*="ActionsRow_stars"]');
      const raitingValue = await raiting.evaluate(el => el.textContent);
      fs.appendFileSync(FILE_PATH, forematted("rating", raitingValue));

      const reviewsCount = await page.waitForSelector('[class*="ActionsRow_root"] [class*="ActionsRow_reviewsWrapper"] a[class*="ActionsRow_reviews"]');
      const reviewsCountValue = await reviewsCount.evaluate(el => el.textContent);
      fs.appendFileSync(FILE_PATH, forematted("reviewCount", reviewsCountValue));

      // SCREENSHOT
      await page.screenshot({
         type: "jpeg",
         path: `${REGION}/screenshot.jpg`,
         // fullPage: true
      });
   } catch (err) {
      console.error(err);
   } finally {
      await page.close();
      await browser.close();
   }
})();

function forematted(key, value) {
   if (value.includes(" ")) value = value.split(" ")[0];
   return `${key}=${value}\n`;
}