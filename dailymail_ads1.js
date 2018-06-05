const puppeteer = require('puppeteer');
const _ = require('lodash');
const fs = require('fs');
const cheerio = require('cheerio');

url = 'http://www.dailymail.co.uk/home/index.html'; //tvf link;

const args = process.argv;
console.log(args);
if(args[2]===""){
    console.log('Please enter an URL after the program name')
    process.exit(1)
}else{
    if(isURL(args[2])){
        url = args[2]
    }
}



function isURL(str) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str); 
  }


(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox","--disable-web-security", "--user-data-dir"]
    });
    const page = await browser.newPage();
    process.on("unhandledRejection", (reason, p) => {
        console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
        browser.close();
      });
    await page.goto(url);
    await page.waitForSelector('body')
    

    // const ads = frames.find((frame) => {
    //     return frame.html();
    //   });
    console.log('Scrolling through page');

    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            try {
                const maxScroll = Number.MAX_SAFE_INTEGER;
                let lastScroll = 0;
                const interval = setInterval(() => {
                    window.scrollBy(0, 1000);
                    const scrollTop = document.documentElement.scrollTop;
                    if (scrollTop === maxScroll || scrollTop === lastScroll) {
                        clearInterval(interval);
                        resolve();
                    } else {
                        lastScroll = scrollTop;
                    }
                }, 500);
            } catch (err) {
                console.log(err);
                reject(err.toString());
            }
        });
    });
    var frames = await page.frames();
    for(i=1;i<frames.length;i++){ //0 is the main owner frame
        var body = await frames[i].$('body')
        var $ = cheerio.load(body)
        //console.log($('img').attr("src"))
        console.log(body)
        fs.appendFileSync('test.txt', JSON.stringify(body))
    }
    // console.log('Dimensions:', dimensions);
    // const adsData = await page.evaluate(() => {

    //     jsonData = []
    //     // data = document.querySelectorAll("iframe[id*='google_ads']")
    //     // data = document.querySelectorAll(".ism-frame")
    //     data = window.frames.$("iframe[id*='ad']")
    //     for (i = 0; i < data.length; i++) {
    //         iframe = (data[i].contentDocument || data[i].contentWindow.document)
    //         img = ''
    //         innerData = data[i].contentWindow.document.childNodes["0"].innerHTML
    //         if (iframe.querySelectorAll('img').length > 0)
    //             img = iframe.querySelector('img').src

    //         // var $ = cheerio.load(innerData)
    //         //fs.writeFileSync('test.html',innerData)
    //         jsonData.push({
    //             //ad_image :document.querySelector('.ism-frame').querySelector('iframe').src
    //             ad_src: img,
    //             //ad_url: iframe.querySelector('img').getAttribute('onclick')
    //             ad_html: iframe.innerHTML,
    //             ad: iframe,
    //             innerHTML: innerData
    //         })
    //     }
    //     // return new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML
    //     return jsonData

    // })

    // // console.log(channeldata[0].link)
    // var allDetails = []
    // for (i = 0; i < adsData.length; i++) {
    //     fs.writeFileSync('temp.html', adsData[i].innerHTML)
    //     await page.goto(__dirname + '/temp.html')
    //     ad = await page.evaluate(() => {
            
    //         function stripScripts(s) {
    //             var div = document.createElement('div');
    //             div.innerHTML = s;
    //             var scripts = div.getElementsByTagName('script');
    //             var i = scripts.length;
    //             while (i--) {
    //                 scripts[i].parentNode.removeChild(scripts[i]);
    //             }
    //             return div.innerHTML;
    //         }
    //         data = []
    //         images = []
    //         links = []
    //         tmp = []
    //         html = []
    //         tmp = document.querySelectorAll('img')
    //         for (j = 0; j < tmp.length; j++) {
    //             images.push(tmp[j].src)
    //         }
    //         tmp = document.querySelectorAll('a')
    //         for (j = 0; j < tmp.length; j++) {
    //             links.push(tmp[j].href)
    //         }
    //         tmp = document.querySelectorAll('div')
    //         for (j = 0; j < tmp.length; j++) {
    //             html.push(stripScripts(tmp[j].innerHTML))
    //         }
    //         data.push({
    //             'images': images,
    //             'links': links,
    //             'html': html
    //         })
    //         return data
    //     })
    //     //fs.appendFileSync('dailymail_ads_links.json', JSON.stringify(ad))
    //     console.log(ad)
    //     allDetails.push(ad)
    // }

    // fs.writeFileSync('dailymail_ads.json', JSON.stringify(allDetails))

    //fs.writeFileSync('dailymail_ads_links.json', JSON.stringify(ad))
    //console.log(adsData)
    // console.log(ads)
    await browser.close();


})();

function stripScripts(s) {
    var div = document.createElement('div');
    div.innerHTML = s;
    var scripts = div.getElementsByTagName('script');
    var i = scripts.length;
    while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
    }
    return div.innerHTML;
}