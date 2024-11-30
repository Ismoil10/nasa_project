
const { 
    getAllLaunches,
    scheduleNewLaunches,
    launchExistsWithId,
    abortLaunchById,
 } = require('../../models/launches.model');

const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res){
   const { limit, skip } = getPagination(req.query);
   const launches = await getAllLaunches(limit, skip)
   return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res){
    const launch = req.body;
    //console.log(req.query);
    if(!launch.mission || !launch.rocket || !launch.target
        || !launch.launchDate){
          return  res.status(400).json({
                error: "Invalid request"
            });
    }

    launch.launchDate = new Date(launch.launchDate);

    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: "launchDate is not a number"
        });
    }

    await scheduleNewLaunches(launch);
    //console.log(launch);
    return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res){
    const launchId = Number(req.params.id);
    //console.log(launchId);
    const existsLaunch = await launchExistsWithId(launchId); 
if(!existsLaunch){
    return res.status(404).json({
        error: "Launch not found",
    });
}
const aborted = await abortLaunchById(launchId);

if(!aborted){
    return res.status(404).json({
        error: "Launch not delete",
    });
}

    return res.status(200).json(aborted);

}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
}