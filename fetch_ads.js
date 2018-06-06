const puppeteer = require('puppeteer');
const _ = require('lodash');
const fs = require('fs');
const cheerio = require('cheerio');

url = 'http://www.dailymail.co.uk/home/index.html'; //test link;

const args = process.argv;
// console.log(args);
if (args[2] === "") {
    console.log('Please enter an URL after the program name')
    process.exit(1)
} else {
    if (isURL(args[2])) {
        url = args[2]
    }
}



function isURL(str) {
    return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(str);
}


(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-web-security", "--user-data-dir"]
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
    for (i = 1; i < frames.length; i++) { //0 is the main owner frame
        console.log('total iframes: '+ frames.length)
        var body = await frames[i].evaluate(() => {
            return document.body.innerHTML
        })
        var $ = cheerio.load(body)
        
        img = ''
   
        jsonData = []
        images=[]
        links=[]
        html=[]
        $('img').each(function(i, elm){
            images.push($(this).attr('src'))
        })
        $('a').each(function(i, elm){
            links.push($(this).attr('href'))
        })
        $('div').each(function(i, elm){
            $(this).remove('script')
            html.push($(this).html())
        })

        fs.writeFileSync('temp.html', $.html())
        
        
        jsonData.push({
            
            ad_image: images,
            ad_url: links,
            ad_html: html,
            
        })
        fs.appendFileSync('ads.json', JSON.stringify(jsonData))
        // fs.appendFileSync('test1.json', JSON.stringify(data))
    }
    
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