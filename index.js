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
        const res = await axios.get(listingsURL, {});

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
