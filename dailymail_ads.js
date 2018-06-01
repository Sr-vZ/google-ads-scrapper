const puppeteer = require('puppeteer');
const _ =require('lodash')
const fs = require('fs')
const cheerio = require('cheerio');


url = 'http://www.dailymail.co.uk/home/index.html'; //tvf link;

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--disable-web-security"]
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('body')
    // const frames = await page.frames();

    // const ads = frames.find((frame) => {
    //     return frame.html();
    //   });
    // console.log('Scrolling through page');

    // await autoScroll(page);

    // await page.evaluate(async () => {
    //     await new Promise((resolve, reject) => {
    //         try {
    //             const maxScroll = Number.MAX_SAFE_INTEGER;
    //             let lastScroll = 0;
    //             const interval = setInterval(() => {
    //                 window.scrollBy(0, 100);
    //                 const scrollTop = document.documentElement.scrollTop;
    //                 if (scrollTop === maxScroll || scrollTop === lastScroll) {
    //                     clearInterval(interval);
    //                     resolve();
    //                 } else {
    //                     lastScroll = scrollTop;
    //                 }
    //             }, 500);
    //         } catch (err) {
    //             console.log(err);
    //             reject(err.toString());
    //         }
    //     });
    // });
    // console.log('Dimensions:', dimensions);
    const adsData = await page.evaluate(() => {
        try{
        jsonData = []
        // data = document.querySelectorAll("iframe[id*='google_ads']")
        // data = document.querySelectorAll(".ism-frame")
        data = window.frames.$("iframe[id*='ad']")
        for (i = 0; i < data.length; i++) {
            iframe = (data[i].contentDocument || data[i].contentWindow.document)
            img=''
            innerData = data[i].contentWindow.document.childNodes["0"].innerHTML
            if(iframe.querySelectorAll('img').length>0)
                img = iframe.querySelector('img').src
            
            var $ = cheerio.load(innerData)

            jsonData.push({
                //ad_image :document.querySelector('.ism-frame').querySelector('iframe').src
                ad_src: img,
                //ad_url: iframe.querySelector('img').getAttribute('onclick')
                ad_html: iframe.innerHTML,
                ad : iframe,
                innerHTML: innerData
            })
        }
        // return new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML
        return jsonData
    }
    catch(err){
        console.log(err)
    }
    })

    // console.log(channeldata[0].link)
    
    fs.writeFileSync('dailymail_ads.json',JSON.stringify(adsData))
    console.log(adsData)
    // console.log(ads)
    await browser.close();
})();

