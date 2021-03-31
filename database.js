const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const debug = require('debug')('Database:INFO');
const errorDebugger = require('debug')('Database:ERROR');
const config = require('config');


class Database {
    constructor() {

    }

    connectToDatabase() {
        return new Promise(async (resolve, reject) => {
            const dbConfig = config.get('dbConfig');
            // const baseurl = `mongodb://127.0.0.1/SonarqubeDataMetric`;
            const baseurl = `mongodb://${dbConfig.host}/${dbConfig.dbName}`;

            await mongoose.connect(baseurl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true
            });

            //Get the default connection
            let db = mongoose.connection;
            //Bind connection to error event (to get notification of connection errors)
            db.on('error', console.error.bind(console, 'MongoDB connection error:'));
            db.once("open", (callback) => {
                debug("Connection succeeded.");
            });

            // //TODO: async await is not working while connecting to database.
            // await mongoose.connect(baseurl, {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            //     useFindAndModify: false,
            //     useCreateIndex: true
            // }).then((data) => {
            //     debug("connected to mongoDB", JSON.stringify(data));
            //     resolve(true);
            // }).catch(err => {
            //     errorDebugger("error occured while connected to mongoDB", JSON.stringify(err));
            //     resolve(false);
            // });
            resolve(true);
        });
    }

    saveDocumentInCollection(appSchema, appModel, collectionName, apiDocId) {
        return new Promise(async (resolve, reject) => {

            try {
                let conn = await this.connectToDatabase();
                if (!!conn) {
                    const schema = new Schema(appSchema);
                    const MyModel = mongoose.model(collectionName, schema);
                    let checkDocument = await MyModel.find({ id: apiDocId }).lean();
                    console.log("checkDocument :: ", checkDocument);
                    if (checkDocument.length === 0) {
                        const modelInstance = new MyModel(appModel);
                        const result = await modelInstance.save();
                        debug(`Saved document in a ${collectionName} ${result}`);
                    }
                    resolve(MyModel);
                } else {
                    debug("Connection is not established yet");
                    resolve();
                }

            } catch (err) {
                errorDebugger("err while saving a documnent :: ", JSON.stringify(err));
                resolve();
            }
        });
    }

    getDocumentFromCollection(ModelClass, sonarSchema, collectionName) {
        return new Promise(async (resolve, reject) => {

            try {
                const dbResponse = await ModelClass.find().lean();
                if (!!dbResponse) {
                    debug("fetching data from db : ", JSON.stringify(dbResponse));
                    resolve(dbResponse);
                } else {
                    debug("data couldn't retrieve.....");
                    resolve();
                }
            } catch (err) {
                errorDebugger("error while fetching data from db :: ", JSON.stringify(err));
                resolve();
            }
        });
    }
}

module.exports = Database;