# eBird custom alerter

A nodeJS tool to generate custom alerts to your phone from eBird using [ntfy](https://ntfy.sh).

## Setup:
1. Download files into a folder of your choice
2. NPM install packages as required
3. Obtain an eBird api key [here](https://ebird.org/api/keygen):
4. Follow the instructions at [ntfy](http://ntfy.sh) to setup and follow a topic
5. Add a file ".env" containing:
    - EBIRD_API_KEY="######"
    - NTFY_URL="http://ntfy.sh/######" 
6. Add a file "config.json", formatted like this: 

![config format](/config_image.PNG)

7. Run the command "node app.js". On each run, any new checklists matching the config file will be sent to the specified ntfy topic. I have this tool set up on a server with a cron job to run every hour.
