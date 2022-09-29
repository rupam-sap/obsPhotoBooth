import OBSWebSocket, { EventSubscription } from 'obs-websocket-js';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import mime from 'mime';
import bodyParser from "body-parser";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* Web Parts - Begin */
const app = express();              //Instantiate an express app, the main work horse of this server
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
const port = 8088;                  //Save the port number where your server will be listening
app.use(express.static('webapp'))
app.use(express.static('images'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
  res.sendFile('inde.html', { root: __dirname + '/webapp' });      //server responds by sending the index.html file to the client's browser                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.listen(port, () => {            //server starts lisreqtening for any attempts from a client to connect at port: {port}
  console.log(`Now listening on port ${port}`);
});


const uploadImage = async (req, res, next) => {
  // to declare some path to store your converted image
  var matches = req.body.data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');
  let decodedImg = response;
  let imageBuffer = decodedImg.data;
  let type = decodedImg.type;
  // let extension = mime.extension(type);
  let fileName = "image.jpeg";// + extension;
  try {
    fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
    return res.send({ "status": "success" });
  } catch (e) {
    next(e);
  }
}

app.post('/upload/image', uploadImage);
/* Web Parts - End */

/* OBS Parts - Begin */
const obs = new OBSWebSocket();

try {
  const {
    obsWebSocketVersion,
    negotiatedRpcVersion
  } = await obs.connect('ws://localhost:4455', 'wdfdp123', {
    rpcVersion: 1
  });
  console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`);
} catch (error) {
  console.error('Failed to connect', error.code, error.message);
}

const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
console.log(`Current Program Scene name is ${currentProgramSceneName}`);


app.get('/setScene', async (req, res) => {
  await obs.call('SetCurrentProgramScene', { sceneName: "" + req.query.scene });
  res.send({ 'status': true });
});

const { NextProgramSceneName } = await obs.call('GetCurrentProgramScene');
console.log(`Current Program Scene name is ${NextProgramSceneName}`);

// await obs.disconnect();
// console.log(`Disconnected from server`);
/* OBS Parts - End */

