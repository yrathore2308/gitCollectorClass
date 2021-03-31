const axios = require('axios');
const config = require('config');
const debug = require('debug')('app:githubservice');
const Database = require('../../database');
const wlogger=require('../../winston');

class Github {
    constructor() {
    }


    getmetricStatisticsOfGithub(apiURL) {
        return new Promise(async (resolve, reject) => {

            const requestParams = {
                method: "GET",
                url: apiURL,
                headers: {
                    "Content-Type": "application/json",
                },
                async: true,
                crossDomain: true
            };
            axios(requestParams)
                .then(response => {
                    debug("Github USer API-RESPONSE :: ", JSON.stringify(response.data));
                    resolve(response.data);
                    wlogger.log('info','matric response %s',JSON.stringify(response.data))
                    wlogger.log('info','matric response %O',response.data);
                })
                .catch(function (error) {
                    // handle error
                    debug(" API-RESPONSE ERROR CATCH BLOCK :: ", JSON.stringify(error));
                    resolve(error);
                });
        });
    }

    saveAndGetGithubUsersData(){

        return new Promise(async (resolve,reject)=>{
            try {
                let apiURL=`${config.get('githubConfig.baseurl')}/users/yrathore2308`
                // let apiURL=`https://api.github.com/users/yrathore2308`
                let apiResponse= await this.getmetricStatisticsOfGithub(apiURL);
                // wlogger.info('APi response reached to');

                let githubUSerSchema = {
                    id: { type: String },  
                    loginUserID: { type: String },
                    nodeID: { type: String },
                    publicRepos: { type: String },
                    createdAt: { type: String },
                    updatedAt: { type: String },
                };

                let githubUSerModel={
                    id:(!!apiResponse.id)?apiResponse.id:'1',  
                    loginUserID: (!!apiResponse.login)?apiResponse.login:"",
                    nodeID: (!!apiResponse.node_id)?apiResponse.node_id:"",
                    publicRepos: (!!apiResponse.public_repos)?apiResponse.public_repos:"",
                    createdAt: (!!apiResponse.created_at)?apiResponse.created_at:"",
                    updatedAt: (!!apiResponse.updated_at)?apiResponse.updated_at:"", 
                }
                let apiDocId = (!!apiResponse.id) ? apiResponse.id : "";
                const collectionName = "githubUserDetails";
                const db = new Database();
                let ModelClass = await db.saveDocumentInCollection(githubUSerSchema, githubUSerModel, collectionName, apiDocId);


                let dbResponse = await db.getDocumentFromCollection(ModelClass, githubUSerSchema, collectionName);
                debug("DB-RESPONSE :: ", JSON.stringify(dbResponse));
                // wlogger.info("DB-RESPONSE  ");
                resolve(dbResponse);
            } catch (error) {

                debug("Error occured :: ", JSON.stringify(error));
                wlogger.error("Error occured :: ", JSON.stringify(error));
                resolve({
                    status: 500,
                    body: "Something went wrong!!"
                });
                
            }
        })
    }





}

module.exports = Github;
