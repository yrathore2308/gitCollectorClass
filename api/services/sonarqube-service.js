const axios = require('axios');
const config = require('config');
const debug = require('debug')('app:sonarqubeService');
const Database = require('../../database');

class SonarQube {
    constructor() {
    }

    getmetricStatisticsOfSonarQube(apiURL) {
        return new Promise(async (resolve, reject) => {

            const requestParams = {
                method: "GET",
                url: apiURL,
                headers: {
                    "Content-Type": "application/json",
                    //    Authorization: "Basic YWRtaW46YWRtaW4="
                },
                auth: {
                    username: 'admin',
                    password: 'admin'
                },
                async: true,
                crossDomain: true
            };
            axios(requestParams)
                .then(response => {
                    debug("API-RESPONSE :: ", JSON.stringify(response.data));
                    resolve(response.data);
                })
                .catch(function (error) {
                    // handle error
                    debug(" API-RESPONSE ERROR CATCH BLOCK :: ", JSON.stringify(error));
                    resolve(error);
                });
        });
    }

    main() {
        return new Promise(async (resolve, reject) => {
            try {
                const metricKey = `
                complexity,
                cognitive_complexity,
                comment_lines,
                comment_lines_density,
                public_documented_api_density,
                public_undocumented_api,
                duplicated_blocks,
                duplicated_files,
                duplicated_lines,
                duplicated_lines_density,
                new_violations,
                violations,
                false_positive_issues,
                open_issues,
                confirmed_issues,
                reopened_issues,
                code_smells,
                new_code_smells,
                sqale_rating,sqale_index,
                new_technical_debt,
                sqale_debt_ratio,
                new_sqale_debt_ratio,
                alert_status,
                quality_gate_details,
                bugs, 
                new_bugs, 
                reliability_rating, 
                reliability_remediation_effort,
                new_reliability_remediation_effort,
                vulnerabilities,
                new_vulnerabilities,
                security_rating,
                security_remediation_effort,
                new_security_remediation_effort,
                classes,
                directories,
                files,
                lines,
                ncloc,
                ncloc_language_distribution,
                functions,
                projects,
                public_api,
                statements,
                branch_coverage,
                new_branch_coverage,coverage,
                new_coverage,line_coverage,
                new_line_coverage,
                lines_to_cover,
                new_lines_to_cover,
                skipped_tests,
                uncovered_conditions,
                new_uncovered_conditions,
                uncovered_lines,
                new_uncovered_lines,
                tests,
                test_execution_time,
                test_errors,
                test_failures,
                test_success_density`;
                let apiURL = `${config.get('sonarqubeConfig.baseurl')}/measures/component?componentKey=${config.get('sonarqubeConfig.projectKey')}&metricKeys=${metricKey}`;
                let apiResponse = await this.getmetricStatisticsOfSonarQube(apiURL);

                let sonarSchema = {
                    id: { type: String },  //ObjectID
                    projectKey: { type: String },
                    projectName: { type: String },
                    projectDescription: { type: String },
                    qualifier: { type: String },
                    measures: { type: Array }
                };

                let sonarModel = {
                    id: (!!apiResponse.component.id) ? apiResponse.component.id : "123",
                    projectKey: (!!apiResponse.component.key) ? apiResponse.component.key : "",
                    projectName: (!!apiResponse.component.name) ? apiResponse.component.name : "",
                    projectDescription: (!!apiResponse.component.description) ? apiResponse.component.description : "",
                    qualifier: (!!apiResponse.component.qualifier) ? apiResponse.component.qualifier : "",
                    measures: (!!apiResponse.component.measures) ? apiResponse.component.measures : []
                }

                let apiDocId = (!!apiResponse.component.id) ? apiResponse.component.id : "";
                const collectionName = "MeasureStatistics";
                const db = new Database();
                let ModelClass = await db.saveDocumentInCollection(sonarSchema, sonarModel, collectionName, apiDocId);

                //fetch data   from databse and then return;
                let dbResponse = await db.getDocumentFromCollection(ModelClass, sonarSchema, collectionName);
                debug("DB-RESPONSE :: ", JSON.stringify(dbResponse));
                resolve(dbResponse);
            }
            catch (err) {
                debug("Error occured :: ", JSON.stringify(ERR));
                resolve({
                    status: 500,
                    body: "Something went wrong!!"
                });
            }
        });
    }
}

module.exports = SonarQube;


