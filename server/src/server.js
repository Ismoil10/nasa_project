const http = require('http');

const { mongoConnect } = require('./services/mongo');

const app = require('./app');

require('dotenv').config();

const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

async function startServer(){
try {
    await mongoConnect();

console.log('Success');

} catch(err){
    
    console.error(err);

}
await loadPlanetsData();
await loadLaunchesData();

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}...`);
});
}

startServer();
