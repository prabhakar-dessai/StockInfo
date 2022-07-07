import express from "express";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

let app = express();

app.use(bodyParser.json());

app.get("/find/:name", async (req, res) => {
	let { name } = req.params;
	res.header("Access-Control-Allow-Origin", "*");
	try {
		let response = await scrapeWebsite(name);
		res.send(response);
	} catch (e) {
		console.log(e);
		res.sendStatus(500);
	}
});

app.listen(5000, () => {
	console.log("server running on port 5000");
});

async function scrapeWebsite(stockName) {
	let browser = await puppeteer.launch({ headless: false });
	let page = await browser.newPage();
	let url = "https://stocks.zerodha.com/";
	let stockData = {
		stockName: stockName,
		stockPrice: null,
		stockPE: null,
		stockDivYield: null,
		stockRevenue: null,
		stockEBITDA: null,
		stockIncome: null,
		stockEPS: null,
	};
	await page.goto(url, { waitUntil: "networkidle2" });
	await page.click("#header-inner-container > div > span > i");
	await page.waitForSelector("#search-stock-input");
	await page.focus("#search-stock-input");
	await page.keyboard.type(stockName);
	await page.waitForTimeout(1000);
	await (await page.$("#react-autowhatever-1-section-0-item-0")).click();
	await page.waitForXPath(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[1]/div[4]/span[1]',
		{ visible: true }
	);
	//await page.waitForTimeout(1000);
	stockData.stockPrice = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[1]/div[4]/span[1]',
		page
	);
	stockData.stockPE = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[3]/div/div/div[1]/div[2]',
		page
	);
	stockData.stockDivYield = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[3]/div/div/div[3]/div[2]',
		page
	);
	let [el] = await page.$x(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[9]/div[1]/a'
	);
	await el.click();
	//await page.screenshot({ path: "screenshot.png" });
	//await page.waitForTimeout(1000);
	await page.waitForXPath(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[4]/div[2]/div/div[11]/div/div[2]/span/span',
		{ visible: true }
	);
	stockData.stockRevenue = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[4]/div[2]/div/div[11]/div/div[2]/span/span',
		page
	);
	stockData.stockEBITDA = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[4]/div[2]/div/div[11]/div/div[8]/span/span',
		page
	);
	stockData.stockIncome = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[4]/div[2]/div/div[11]/div/div[14]/span/span',
		page
	);
	stockData.stockEPS = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[4]/div[2]/div/div[11]/div/div[15]/span/span',
		page
	);
	let [el2] = await page.$x(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[2]/div[1]/div[2]/input'
	);
	await el2.click();
	await page.waitForXPath(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[4]/div[2]/div/div[11]/div/div[14]/span/span',
		{ visible: true }
	);
	stockData.stockTAssets = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[4]/div[2]/div/div[11]/div/div[14]/span/span',
		page
	);
	stockData.stockTLiabilities = await scrape(
		'//*[@id="app-container"]/div/div/div[2]/div[2]/div[3]/div[4]/div[2]/div/div[11]/div/div[23]/span/span',
		page
	);

	await browser.close();
	return stockData;
}

async function scrape(xPath, page) {
	let [el] = await page.$x(xPath);
	let data = await el.getProperty("textContent");
	return await data.jsonValue();
}
