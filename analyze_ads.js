const fs = require('fs');
const cheerio = require('cheerio')
// var http = require('http')

const puppeteer = require('puppeteer');

var urlExists = require('url-exists');


data = JSON.parse(fs.readFileSync('dailymail_ads.json'))

for (i = 0; i < data.length; i++) {
    //fs.writeFileSync('test' + i + '.html', data[i].innerHTML)
    var $ = cheerio.load(data[i].innerHTML)
    //console.log($.('img').src)
    images = []
    $('img').each(function (i, elem) {
        //images[i]=$(this).attr('src')
        imageURL = $(this).attr('src')
        if (imageURL != null) {
            if (checkImageURL(imageURL)) {
                images[i] = imageURL
            } else {
                images[i] = ''
            }
        }
    })
    links = []
    $('a').each(function (i, elem) {
        url = $(this).attr('href')
        links[i] = url
    })

    

}

function checkImageURL(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}