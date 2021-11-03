var admin = require('firebase-admin');
let serviceAccount = require('./serviceAccountKey.json');
let serviceAccountLive = require('./serviceAccountKeyLive.json');
let serviceAccountLocal = require('./serviceAccountKeyLocal.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountLive)
    });

//console.log(admin);
var db = admin.firestore();
var Db = db;
//console.log(Db);
module.exports = Db;

