const dotenv = require('dotenv').config();
const fs = require('fs');

const eBirdKey = process.env.EBIRD_API_KEY;
const ntfyURL = process.env.NTFY_URL;

async function fetchEbirdResults (location) {
    let results = await fetch("https://api.ebird.org/v2/product/lists/" + location + "?key=" + eBirdKey + "&maxResults=200");
    return await results.json();
}

let config = JSON.parse(fs.readFileSync('config.json'));
let lastResults = JSON.parse(fs.readFileSync('savedResults.json'));

let locations = config.locations;
let savedChecklists = {}
let toEmail = [];
let promisesArray = [];

for (let location of locations) {
    let curLocationToSave = {
        checklists:[]
    }
    savedChecklists[location.id] = curLocationToSave;

    let eBirdResults = fetchEbirdResults(location.id)
    promisesArray.push(eBirdResults);
    eBirdResults.then(results => {
        results.forEach(checklist => {
           curLocationToSave.checklists.push(checklist.subId); 
        });

        // shorten results list to avoid unstable behaviour when multiple checklists have the same time at the end of the list
        results.length = results.length - 5;
        console.log(results[results.length - 1]);

        if (lastResults.hasOwnProperty(location.id)) {
            results = results.filter(checklist => {
                return lastResults[location.id].checklists.indexOf(checklist.subId) == -1
            });
        }

        if (location.hasOwnProperty("min_species")) {
            results = results.filter(checklist => checklist.numSpecies >= location.min_species);
        }

        results.forEach(checklist => {
            toEmail.push(checklist);
        });
    });
}

Promise.all(promisesArray).then(() => {
    if (toEmail.length > 0) {
        console.log("new results found");
        let allOutput = ""
        toEmail.forEach(checklist => {
            let output = 
                "Location: " +
                checklist.loc.name +        
                " Observer: " +
                checklist.userDisplayName +
                ", " +
                checklist.numSpecies +
                " species observed, " +
                checklist.obsDt +
                " " +
                checklist.obsTime +
                " https://ebird.org/checklist/" +
                checklist.subId;
            console.log(output);
            allOutput += output + "\n";
        });
        fetch(
            ntfyURL,
            {
                method: 'POST',
                body: allOutput
            }
        );
    }
    
    fs.writeFileSync('savedResults.json', JSON.stringify(savedChecklists, null, 2));
});




