const express = require('express');
const router = express.Router();
//const asyncMiddleware = require('../middleware/async');
const SonarService = require('../services/sonarqube-service');
const sonarService = new SonarService();
const debug = require('debug')('app:sonarController');

router.get('/metricsData', async (req, res) => {
    let dataMetrics = await sonarService.main();
    debug("dataMetrics :: ", JSON.stringify(dataMetrics));
    res.send(dataMetrics);

});

module.exports = router;


