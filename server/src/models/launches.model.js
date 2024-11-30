const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

async function getAllLaunches(limit, skip){
   return await launchesDatabase.find({}, {
    '_id': 0,
    '__v': 0,
   })
   .skip(skip)
   .sort({
    flightNumber: 1,
   })
   .limit(limit);
}


const DEFAULT_FLIGHT_NUMBER = 100;

async function indexedFlightNumber(){
   const latestlaunch = await launchesDatabase
    .findOne()
    .sort('-flightNumber');

    if(!latestlaunch){
        return await DEFAULT_FLIGHT_NUMBER;
    }

    return await latestlaunch.flightNumber;
}

async function scheduleNewLaunches(launch){
    const planet = await planets.findOne({
        keplerName: launch.target,
    });

    if(!planet){
         throw new Error('Error');          
    }

    const latestFlightNumber = await indexedFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['Veritasium', 'NASA'],
        flightNumber: latestFlightNumber,
    })

   await saveLaunch(newLaunch);
}

async function saveLaunch(launch){

    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true,
    })
} 

async function launchExistsWithId(launchId){
    return await launchesDatabase.findOne({
        flightNumber: launchId,
    });
}

async function abortLaunchById(launchId){
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        success: false,
        upcoming: false,
    });
    console.log(aborted);
    return aborted.modifiedCount == 1;
}

const axios = require('axios');

const SPACEX_API_URL = 'https://api.spacexdata.com/v5/launches/query';

async function loadLaunchesData(){
    //console.log(axios);
const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            populate: [
                {
                path: 'rocket',
                select: {
                    name: 1
                }
                },
                {
                    path: 'payloads',
                    select: {
                        name: 1
                    } 
                }
            ]
        }
    })

    const launchDocs = response.data.docs;
    
    for(const launchDoc of launchDocs){
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['name'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers[0],
        };
        //console.log(launch);
      await saveLaunch(launch);  
    }
}

module.exports = {
    loadLaunchesData,
    getAllLaunches,
    scheduleNewLaunches,
    launchExistsWithId,
    abortLaunchById,
}