var nodemailer = require('nodemailer');
let common = require('./common.controller');
module.exports.registerNewDoc = function (req, res) {
    console.log(req.body);
    var filepath = '';
    if(req.files[0] != undefined){
        var path = req.files[0].path;
        filepath = path.substr(path.indexOf("/") + 1);
        //var pathArr = path.split('\\');
        //filepath = pathArr[1]+'/'+pathArr[2];
    }
    console.log(filepath);
   //return false;
    Db.collection('Providers').where('email', '==', req.body.email.toLowerCase()).get()
    .then(snapshot => {
        if (snapshot.empty) {
            Db.collection('Providers').add({
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                image : filepath,
                canLogin: false,
            }).then(ref => {

                // var transporter = nodemailer.createTransport({
                //     service: 'gmail',
                //     auth: {
                //       user: 'sikandaraliakram1@gmail.com',
                //       pass: 'Zain@123ali@@'
                //     }
                //   });
                  
                //   var mailOptions = {
                //     from: 'sikandaraliakram1@gmail.com',
                //     to: 'sikandaraliakram1@gmail.com',
                //     subject: 'Sending Email using Node.js',
                //     text: 'That was easy!'
                //   };
                  
                //   transporter.sendMail(mailOptions, function(error, info){
                //     if (error) {
                //       console.log(error);
                //     } else {
                //       console.log('Email sent: ' + info.response);
                //     }
                //   });


                console.log(ref);
                 // save log
                 let msgobj = {
                    msg : 'Doctor registered',
                    id : ref.id,
                    colec : 'Providers'
                }
                common.saveLog(msgobj);
                // save log
                res.json({status : 'success', msg : 'Saved Successfully', docId : ref.id});
            });
        }else{
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                res.json({status : 'error', msg : req.body.email +' already exists.', docId : req.body.docId});
            });
            
        }  
        
    })
  .catch(err => {
    console.log('Error getting documents', err);
  });
}

module.exports.UpdateNewDoc = function (req, res) {
    req.body.canLogin = true;
    req.body.approved = true;
    //console.log(req.body);
    let regDate = req.body.regDate.split('-');
    let newrdate = regDate[2]+'/'+regDate[1]+'/'+regDate[0];
    console.log(req.body, newrdate)
    Db.collection('Doctors')
    .where('REGISTRATION DATE', '==', newrdate)
    .where('LICENSE ID', '==', +req.body.stateRegNumber)
    .where('YEAR OF PASSING', '==', req.body.qualificationYear)
    .where('REGISTRATION NUMBER', '==', req.body.indianRegNumber)
    .get()
    .then(snapshot => {
        if (snapshot.empty) {
            req.body.crossCheck = false;
            Db.collection('Providers').doc(req.body.docId).update(req.body).then(ref => {
                console.log(ref);
                // save log
                let msgobj = {
                    msg : 'Prfile Updated by Doctor',
                    id : req.body.docId,
                    colec : 'Providers'
                }
                common.saveLog(msgobj);
                // save log
                res.json({status : 'success', msg : 'Updated Successfully! Thank you for registering, information entered by you doesn’t match with Indian Medical Council website. Please edit your profile and enter the correct information.', docId : req.body.docId});
            });
        }else{
            req.body.crossCheck = true;
            Db.collection('Providers').doc(req.body.docId).update(req.body).then(ref => {
                console.log(ref);
                // save log
                let msgobj = {
                    msg : 'Prfile Updated by Doctor',
                    id : req.body.docId,
                    colec : 'Providers'
                }
                common.saveLog(msgobj);
                // save log
                res.json({status : 'success', msg : 'Updated Successfully', docId : req.body.docId});
            });
        }
    })
}

module.exports.UpdateDocImage = function (req, res) {
    console.log(req.body);
    var filepath = '';
    if(req.files[0] != undefined){
        var path = req.files[0].path;
        filepath = path.substr(path.indexOf("/") + 1);
        //var pathArr = path.split('\\');
        //filepath = pathArr[1]+'/'+pathArr[2];
    }
    console.log(filepath);

    Db.collection('Providers').doc(req.body.docId).update({image : filepath}).then(ref => {
        console.log(ref);
        // save log
        let msgobj = {
            msg : 'Picture Updated by Doctor',
            id : req.body.docId,
            colec : 'Providers'
        }
        common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Updated Successfully', docId : req.body.docId, filepath : filepath});
    });
}

module.exports.loginDoctor = function (req, res) {
    console.log(req.body);
    var condition = 'email';
    if(req.body.key === 'phone'){
        condition = 'numberToLogin';
    }
    console.log(condition);
    Db.collection('Providers').where(condition, '==', req.body.loginWith.toLowerCase()).where('password', '==', req.body.password).get()
    .then(snapshot => {
        if (snapshot.empty) {
            res.json({status : 'error', msg : 'Incorrect Details Entered.'});
        }else{
            snapshot.forEach(doc => {
                // save log
                let msgobj = {
                    msg : 'Doctor Logged in',
                    id : doc.id,
                    colec : 'Providers'
                }
                common.saveLog(msgobj);
                // save log
                console.log(doc.id, '=>', doc.data());
                res.json({status : 'success', msg : 'Login successfull.', docId : doc.id, docData : doc.data()});
            });
            
        }
    })
}

module.exports.addSubscriptionPlan = function (req, res) {
    console.log(req.body);
    if(req.body.docId != undefined && req.body.docId != ""){
        Db.collection('Doc_fee_plans').doc(req.body.docId).update(req.body).then(ref => {
            console.log(ref);

            // save log
            let msgobj = {
                msg : 'Subscripttion Plan updated by Doctor',
                id : req.body.doctor_id,
                colec : 'Providers'
            }
            common.saveLog(msgobj);
            // save log
            var resObj = {status : 'success', msg : 'updated Successfully', docId : req.body.doctor_id};
            getsubscriptioplans(req, res, resObj);
            //res.json({status : 'success', msg : 'Saved Successfully', docId : ref.id});
        })  
        .catch(err => {
            console.log('Error getting documents', err);
        });
    }else{
        Db.collection('Doc_fee_plans').add(req.body).then(ref => {
            console.log(ref);
            // save log
            let msgobj = {
                msg : 'Subscripttion Plan Added by Doctor',
                id : req.body.doctor_id,
                colec : 'Providers'
            }
            common.saveLog(msgobj);
            // save log
            var resObj = {status : 'success', msg : 'Saved Successfully', docId : req.body.doctor_id};
            getsubscriptioplans(req, res, resObj);
            //res.json({status : 'success', msg : 'Saved Successfully', docId : ref.id});
        })  
        .catch(err => {
            console.log('Error getting documents', err);
        });
    }
}

function getsubscriptioplans (req, res, resObj) {
    console.log(req.body);
    var doctor_id = req.body.doctor_id;
    var plans = [];
    Db.collection('Doc_fee_plans').where('doctor_id', '==', doctor_id).get()
    .then(snapshot => {
        if (snapshot.empty) {
                res.json({status : resObj.status, msg : resObj.msg});
        }else{
            snapshot.forEach(doc => {
                var tempArr = doc.data();
                tempArr.docId = doc.id;
                plans.push(tempArr);
            });
            res.json({status : resObj.status, msg : resObj.msg, plans_data : plans});
        }  
        
    })
  .catch(err => {
    console.log('Error getting documents', err);
  });
}

module.exports.addNoteByDr = function (req, res) {
    console.log(req.body);
    // return false;
    Db.collection('PatientResults').doc(req.body.test_id).get()
    .then(doc => {
        if(doc.exists){
            var resultsData = doc.data();
            note = {
                dr_name : req.body.doctor_name,
                note : req.body.noteByDr,
                note_date : new Date().toISOString()
            }
            var resultNotes = resultsData.notes;
            if(resultNotes == undefined){
                resultNotes = [];  
            }
            resultNotes.push(note);
            Db.collection('PatientResults').doc(req.body.test_id).update({
                notes : resultNotes
            })
            .then(ref => {
                console.log(ref);
                // save log
                let msgobj = {
                    msg : 'Result Note updated by Doctor',
                    id : req.body.doctor_id,
                    colec : 'Providers'
                }
                common.saveLog(msgobj);
                // save log
                Db.collection('Report_'+req.body.doctor_id+'_bypat').doc(req.body.docId).get()
                .then(doc => {
                    if(doc.exists){
                        var resultsData = doc.data();
                        note = {
                            dr_name : req.body.doctor_name,
                            note : req.body.noteByDr,
                            note_date : new Date().toISOString()
                        }
                        var resultNotes = resultsData.notes;
                        if(resultNotes == undefined){
                            resultNotes = [];  
                        }
                        resultNotes.push(note);
                        Db.collection('Report_'+req.body.doctor_id+'_bypat').doc(req.body.docId).update({
                            notes : resultNotes
                        })
                        .then(ref => {
                           // save log
                            let msgobj = {
                                msg : 'Result Note Added by Doctor',
                                id : req.body.doctor_id,
                                colec : 'Providers'
                            }
                            common.saveLog(msgobj);
                            // save log 
                            res.json({status : 'success', msg : 'Note Added Successfully' });
                        })
                    } 
                    })
                
            });

        }
    })
    
}

module.exports.changeReportStatus = function (req, res) {
    console.log(req.body);
    // return false;
    Db.collection('PatientResults').doc(req.body.test_id).update({
        statusByDr : req.body.statusByDr
    }).then(ref => {
        Db.collection('Report_'+req.body.doctor_id+'_bypat').doc(req.body.docId).update({
            statusByDr : req.body.statusByDr
        })
        .then(ref => {
            // save log
            let msgobj = {
                msg : 'Result status changed by Doctor',
                id : req.body.doctor_id,
                colec : 'Providers'
            }
            common.saveLog(msgobj);
            // save log
            res.json({status : 'success', msg : 'Status Updated Successfully' });
        })
    });
}

module.exports.delSubscriptionPlan = function (req, res) {
    
    Db.collection("Doc_fee_plans").doc(req.body.planId).delete().then(ref => {
        console.log("Document successfully deleted!");
            // save log
            let msgobj = {
                msg : 'Suscription Plan Deleted by Doctor',
                id : req.body.doctor_id,
                colec : 'Providers'
            }
            common.saveLog(msgobj);
            // save log
        res.json({status : 'success', msg : 'Plan successfully deleted', docId : req.body.planId});
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
}

module.exports.getComissionData = function (req, res){
    console.log(req.query);
    var comissions = [];
    Db.collection('Report_'+req.query.id+'_bypat').where('canShowNow', '==', true).get()
    .then(snapshot => {
        if(snapshot.empty){
            res.json({status : 'error', msg : 'No Record Found'});
        }else{
            snapshot.forEach(doc => {
                var tempArr = doc.data();
                tempArr.docId = doc.id;
                console.log(tempArr);
                comissions.push(tempArr);
            })
            res.json({status : 'success', msg : 'Record Found!', comissionData : comissions});
        }
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });
}