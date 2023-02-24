# Crowdloan CronJob

The purpose of this cronjob is to check if there are any new active crowdloans on the Polkadot and Kusama Relay Chains. If there are, it will add it to the firebase database and and create a GitHub issue for it.

This helps ease the burden of the Talisman team to keep track of all the crowdloans that are currently active.

## Get Started

1. Clone the repo
   `git clone https://github.com/JAhimaz/Crowdloan-Cronjob.git`

2. Install dependencies
   `yarn install`

3. Edit the firebase config to match your database. (Planning on moving to a local storage though)

4. Run the cronjob by running the following command
   `yarn start`

5. Push to GitHub and create a GitHub Action to run the cronjob.
