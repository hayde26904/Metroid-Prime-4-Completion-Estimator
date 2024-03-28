const cheerio = require('cheerio');
const axios = require('axios');

let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.set('view engine', 'ejs');

app.use('/static', express.static(__dirname+'/static'));

const listingsURL = 'https://2oc84v7py6.execute-api.us-west-2.amazonaws.com/prod/api/jobs/?type=us';

function filterListings(listings, word) {
    let jobOpenings = listings;
    for (var i = jobOpenings.length - 1; i > -1; i--) {
        var title = jobOpenings[i].JobTitle;
        title = title.toLowerCase();
        if (title.indexOf(word) < 0) {
            // REMOVE FROM DATA
            jobOpenings.splice(i, 1);
        }
    }
}

async function getJobListings(listingsURL) {
    try {
        const res = await axios.get(listingsURL, {
            headers: {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.5",
                "if-modified-since": "Thu, 28 Mar 2024 00:48:43 GMT",
                "if-none-match": "\"155a0459-e611-4bcd-a8e4-8e7f5b7b2b1e\"",
                "sec-ch-ua": "\"Brave\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "cross-site",
                "sec-gpc": "1",
                "Referer": "https://careers.nintendo.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
        });

        return res.data;
    } catch (error) {
        console.error("Error fetching job listings:", error);
        throw error;
    }
}

function calculateCompletionPercentage(jobListingsNum) {
    return 100 - (jobListingsNum * 5);
}

(async () => {
    const listings = await getJobListings(listingsURL);
    filterListings(listings, "retro");

    const completionPercentage = calculateCompletionPercentage(listings.length);

    console.log(`Metroid Prime 4 is ${completionPercentage}% complete!`);

    app.get('/', function (req, res) {
        res.render('index.ejs', {
            completion: completionPercentage
        });
    });

    app.listen(8080);
    console.log('server started');

})()