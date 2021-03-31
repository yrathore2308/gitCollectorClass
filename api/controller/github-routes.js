const express = require('express');
const logger = require('../../winston');
const router = express.Router();
const GithubService = require('../services/github-service');
const githubService = new GithubService();
const wlogger=require('../../winston');


router.get('/gitHubUserData', async (req, res) => {
    wlogger.info=('reached to main routing')
    let userdataMetrics = await githubService.saveAndGetGithubUsersData();
    res.send(userdataMetrics);

});

module.exports = router;