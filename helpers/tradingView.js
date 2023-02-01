require('chromedriver');
const browserChrome = require("selenium-webdriver/chrome")
const webdriver = require('selenium-webdriver');
const fs = require("fs");
const util = require("util");
const {
    By,
    Key,
    until, promise
} = require("selenium-webdriver");

let summary = {
    "sell" :0,
    "buy":0,
    "neutral":0
}

let oscillators = {
    "sell" :0,
    "buy":0,
    "neutral":0
}

let ma = {
    "sell" :0,
    "buy":0,
    "neutral":0
}

const sumSell = '//*[@id="technicals-root"]/div/div[3]/div[2]/div[2]/div[1]/span[2]';
const sumBuy = '//*[@id="technicals-root"]/div/div[3]/div[2]/div[2]/div[2]/span[2]';
const sumNeutral = '//*[@id="technicals-root"]/div/div[3]/div[2]/div[2]/div[3]/span[2]';

const maSell = '//*[@id="technicals-root"]/div/div[3]/div[3]/div[2]/div[1]/span[2]';
const maBuy = '//*[@id="technicals-root"]/div/div[3]/div[3]/div[2]/div[3]/span[2]';
const maNeutral = '//*[@id="technicals-root"]/div/div[3]/div[3]/div[2]/div[2]/span[2]';

const ostrSell = '//*[@id="technicals-root"]/div/div[3]/div[1]/div[2]/div[1]/span[2]';
const ostrBuy = '//*[@id="technicals-root"]/div/div[3]/div[1]/div[2]/div[3]/span[2]';
const ostrNeutral = '//*[@id="technicals-root"]/div/div[3]/div[1]/div[2]/div[2]/span[2]';

const clickOur = {
    0 : '1m',
    1 : '5m',
    2 : '15m',
    3 : '30m',
    4 : '1h',
    5 : '4h',
    6 : '1D'

}
async function openWeb(symbol) {
    let data = {
        summary: {

        },
        oscillators: {

        },
        ma: {

        }
    }
    return new Promise(async function(resolve, reject) {
        let driver = new webdriver.Builder().forBrowser('chrome').build();
        driver.manage().window().maximize();
        try{
            await driver.get('https://www.tradingview.com/symbols/'+symbol+'/technicals/')
            for(let i = 0; i < 7; i++){
                await driver.findElement(By.xpath('//*[@id="'+clickOur[i]+'"]')).click();

                data.summary[clickOur[i]] = {"sell":await driver.findElement(By.xpath(sumSell)).getText(), "buy":  await driver.findElement(By.xpath(sumBuy)).getText(), "neutral": await driver.findElement(By.xpath(sumNeutral)).getText()}
                data.oscillators[clickOur[i]] = {"sell":await driver.findElement(By.xpath(ostrSell)).getText(), "buy":  await driver.findElement(By.xpath(ostrBuy)).getText(), "neutral": await driver.findElement(By.xpath(ostrNeutral)).getText()}
                data.ma[clickOur[i]] = {"sell":await driver.findElement(By.xpath(maSell)).getText(), "buy":  await driver.findElement(By.xpath(maBuy)).getText(), "neutral": await driver.findElement(By.xpath(maNeutral)).getText()}

            }


            if(data.oscillators.buy != 0 || data.oscillators.sell != 0 || data.oscillators.neutral != 0){
                resolve(data);
                driver.quit();
            }else{      }
        }
        catch (e){
            console.log(e);
        }


    });


    //await driver.findElement(By.name('kaydet')).sendKeys(Key.RETURN);



}



module.exports = openWeb;
