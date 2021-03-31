//require('express-async-errors');
const express = require('express');
const app = express();
// const sonarqubeController = require('./api/controller/sonarqube-routes');
const githubController=require('./api/controller/github-routes')
const bodyParser = require('body-parser');
const config = require('config');
const wlogger=require('./winston.js');


/* load the .env variable into process.env
*/
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const debug = require('debug')('app:startup');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// app.use('/api/sonarqube', sonarqubeController);
app.use('/api/github', githubController);

// single place to handle the error
//app.use(error);

const port = !!(config.get("SERVER_PORT")) ? config.get("SERVER_PORT") : !!(process.env.SERVER_PORT) ? process.env.SERVER_PORT : 8080;
app.listen(3000, () => {
  debug(`Application running on ${port}`);
  wlogger.info('Hello again distributed logs');

  console.log(`Application running on ${port}`);
});


