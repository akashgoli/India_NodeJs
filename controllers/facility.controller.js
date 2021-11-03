let common = require('./common.controller');
module.exports.registerNewHcf = function (req, res) {
    console.log(req.body, req.files);
    var filepath = '';
    if(req.files[0] != undefined){
        var path = req.files[0].path;
        filepath = path.substr(path.indexOf("/") + 1);
        //var pathArr = path.split('\\');
        //filepath = pathArr[1]+'/'+pathArr[2];
    }
    Db.collection('Health_care_facility').where('email', '==', req.body.email.toLowerCase()).get()
    .then(snapshot => {
        if (snapshot.empty) {
            Db.collection('Health_care_facility').add({
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                image : filepath,
                canLogin: false,
            }).then(ref => {
                console.log(ref);
                 // save log
                 let msgobj = {
                    msg : 'HCF registered',
                    id : ref.id,
                    colec : 'Health_care_facility'
                }
                common.saveLog(msgobj);
                // save log
                res.json({status : 'success', msg : 'Saved Successfully', docId : ref.id});
            });
        }else{
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                res.json({status : 'error', msg : req.body.email +' already exists.', docId : doc.id});
            });
            
        }  
        
    })
  .catch(err => {
    console.log('Error getting documents', err);
  });
}

module.exports.UpdateNewHcf = function (req, res) {
    req.body.canLogin = true;
    console.log(req.body);
    Db.collection('Health_care_facility').doc(req.body.docId).update(req.body).then(ref => {
        console.log(ref);
        // save log
        let msgobj = {
            msg : 'Prfile Updated by HCF',
            id : req.body.docId,
            colec : 'Health_care_facility'
        }
        common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Updated Successfully', docId : req.body.docId});
    });
}

module.exports.UpdateHcfImage = function (req, res) {
    console.log(req.body);
    var filepath = '';
    if(req.files[0] != undefined){
        var path = req.files[0].path;
        filepath = path.substr(path.indexOf("/") + 1);
        //var pathArr = path.split('\\');
        //filepath = pathArr[1]+'/'+pathArr[2];
    }
    console.log(filepath);

    Db.collection('Health_care_facility').doc(req.body.docId).update({image : filepath}).then(ref => {
        console.log(ref);
        // save log
        let msgobj = {
            msg : 'Picture Updated by HCF',
            id : req.body.docId,
            colec : 'Health_care_facility'
        }
        common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Updated Successfully', docId : req.body.docId, filepath : filepath});
    });
}

module.exports.loginHcf = function (req, res) {
    console.log(req.body);
    var condition = 'email';
    if(req.body.key === 'phone'){
        condition = 'numberToLogin';
    }
    Db.collection('Health_care_facility').where(condition, '==', req.body.loginWith.toLowerCase()).where('password', '==', req.body.password).get()
    .then(snapshot => {
        if (snapshot.empty) {
            res.json({status : 'error', msg : 'Incorrect  Details Entered.'});
        }else{
            snapshot.forEach(doc => {
                // save log
                let msgobj = {
                    msg : 'HCF Logged in',
                    id : doc.id,
                    colec : 'Health_care_facility'
                }
                common.saveLog(msgobj);
                // save log
                console.log(doc.id, '=>', doc.data());
                res.json({status : 'success', msg : 'Login successfull.', docId : doc.id, docData : doc.data()});
            });
            
        }
    })
}
module.exports.loginHcfMember = function (req, res) {
    console.log(req.body);
    var condition = 'memberEmail';
    if(req.body.key === 'phone'){
        condition = 'numberToLogin';
    }
    Db.collection('Hcf_members').where('hcf_id', '==', req.body.hcf.docId).where(condition, '==', req.body.loginWith.toLowerCase()).where('password', '==', req.body.password).get()
    .then(snapshot => {
        if (snapshot.empty) {
            res.json({status : 'error', msg : 'Incorrect Details Entered.'});
        }else{
            snapshot.forEach(doc => {
                // save log
                let msgobj = {
                    msg : 'HCF Member Logged in',
                    id : doc.id,
                    colec : 'Hcf_members'
                }
                common.saveLog(msgobj);
                // save log
                console.log(doc.id, '=>', doc.data());
                res.json({status : 'success', msg : 'Login successfull.', docId : doc.id, docData : doc.data()});
            });
            
        }
    })
}

module.exports.addMember = function(req, res){
    Db.collection('Hcf_members').where('memberEmail', '==', req.body.memberEmail.toLowerCase()).where('status', '==', 'active').get()
    .then(snapshot => {
        if(snapshot.empty){
            Db.collection('Hcf_members').add({
                hcf_id: req.body.hcf_id,
                hcf_name: req.body.hcf_name,
                position: req.body.position,
                memberName: req.body.memberName,
                memberEmail: req.body.memberEmail.toLowerCase(),
                mobileNo: req.body.mobileNo,
                password: req.body.password,
                status: req.body.status,
                canLogin : true
            }).then(ref => {
                // save log
                let msgobj = {
                    msg : 'New Member Added by HCF ',
                    id : req.body.hcf_id,
                    colec : 'Health_care_facility'
                }
                common.saveLog(msgobj);
                // save log
                res.json({status : 'success', msg : 'Saved Successfully', docId : req.body.hcf_id});
            });
        }else{
            snapshot.forEach(doc => {
                res.json({status : 'found', msg : 'Already Exist.', memberData : doc.data()});
            });
        }
    })
}

module.exports.updateMember = function(req, res){
    console.log(req.body);
    Db.collection('Hcf_members').doc(req.body.member_id_for_edit).update(req.body).then(ref => {
        console.log(ref);
        // save log
        let msgobj = {
            msg : 'Member Profile updated by HCF',
            id : req.body.hcf_id,
            colec : 'Hcf_members'
        }
        common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Updated Successfully', docId : req.body.docId});
    });
}

module.exports.getMembers = function(req, res){
    console.log(req.query);
    var hcf_id = req.query.hcf_id;
    var members = [];
    Db.collection('Hcf_members').where('hcf_id', '==', hcf_id).get()
    .then(snapshot => {
        if(snapshot.empty){
            res.json({status : 'error', msg : 'No Member Found!'});
        }else{
            snapshot.forEach(doc => {
                var tempArr = doc.data();
                tempArr.docId = doc.id;
                members.push(tempArr);
            });
            res.json({status : 'success', msg : 'Members Found!', members_data : members});
        }
    })
}

module.exports.changeMemberStatus = function (req, res) {
    console.log(req.body);
    // return false;
    Db.collection('Hcf_members').doc(req.body.docId).update(req.body).then(ref => {
        console.log(ref);
        // save log
        let msgobj = {
            msg : 'Member status changed by HCF',
            id : req.body.hcf_id,
            colec : 'Health_care_facility'
        }
        common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Updated Successfully', docId : req.body.docId});
    });
}

module.exports.addPatResultbyHCF = function (req, res) {
    console.log(req.body);
    // return false;
    var hcf_member_id = '';
    var hcf_member_name = '';
    if(req.body.user_type == 'hcf_member'){
        hcf_member_id = req.body.hcf_member_id;
        hcf_member_name = req.body.hcf_member_name;
    }
    var filepath = '';
    var filesArr = [];
    if(req.files[0] != undefined){
        req.files.forEach(element => {
            temApp = {};
            temApp['name'] = element.originalname;
            temApp['path'] = element.path.substr(element.path.indexOf("/") + 1);
            filesArr.push(temApp);
        });
        
    }
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let addPatientResults = Db.collection('PatientResults').add({
        testName: req.body.testName,
        // details: req.body.details,
        procedure_id: req.body.procedure_id,
        procedure: req.body.procedure,
        subProcedure: req.body.subProcedure,
        subProcedure_id: req.body.subProcedure_id,
        // physician: req.body.physician,
        pat_hcf: req.body.pat_hcf,
        hcf_name : req.body.hcf_name,
        patient_id:req.body.patient_id,
        hcf_member_id:hcf_member_id,
        hcf_member_name:hcf_member_name,
        patient_name:req.body.patientName,
        reportFile : filesArr,
        created_date : date,
    }).then(ref => {
        console.log(ref);
        // save log
        let msgobj = {
            msg : 'Patient Result Added by HCF',
            id : req.body.pat_hcf,
            colec : 'Health_care_facility'
        }
        common.saveLog(msgobj);
        // save log
        Db.collection('Report_'+req.body.pat_hcf).get()
        .then(snapshot => {
            if(snapshot.empty){
                console.log('Not Found');
                Db.collection('Report_'+req.body.pat_hcf).add({
                    patient_id : req.body.patient_id,
                    patient_name : req.body.patientName,
                    patient_email : req.body.patientEmail.toLowerCase(),
                    patient_phone : req.body.pat_Phone,
                    gender : req.body.pat_gender,
                    state : req.body.pat_state,
                    dob : req.body.pat_dob,
                })
                .then(ref => {
                    Db.collection('Report_'+req.body.patient_id+'by_hcf').get()
                    .then(snapshot => {
                        if(snapshot.empty){
                            console.log('Patient Collection Not Found');
                            Db.collection('Report_'+req.body.patient_id+'by_hcf').add({
                                hcf_id : req.body.pat_hcf,
                                hcf_name : req.body.hcf_name,
                                hcf_email : req.body.hcf_email.toLowerCase(),
                                hcf_phone : req.body.hcf_phone,
                                hcf_state : req.body.hcf_state,
                                hcf_city : req.body.hcf_city,
                                hcf_address : req.body.hcf_address
                            })
                            .then(ref => {

                            })
                            .catch(err => {
                                console.log('Error getting Patient Collection if collection', err);
                            })
                        }else{
                            Db.collection('Report_'+req.body.patient_id+'by_hcf').where('hcf_id', '==', req.body.pat_hcf).get() 
                            .then(snapshot => {
                                if(snapshot.empty){
                                    Db.collection('Report_'+req.body.patient_id+'by_hcf').add({
                                        hcf_id : req.body.pat_hcf,
                                        hcf_name : req.body.hcf_name,
                                        hcf_email : req.body.hcf_email.toLowerCase(),
                                        hcf_phone : req.body.hcf_phone,
                                        hcf_state : req.body.hcf_state,
                                        hcf_city : req.body.hcf_city,
                                        hcf_address : req.body.hcf_address
                                    })
                                    .then(ref => {
        
                                    })
                                    .catch(err => {
                                        console.log('Error getting Patient Collection first Else collection', err);
                                    })
                                }
                            })
                        }
                    })
                })
                .catch(err => {
                    console.log('Error creating collection', err);
                });
            }else{
                console.log('Found');
                Db.collection('Report_'+req.body.pat_hcf).where('patient_id', '==', req.body.patient_id).get()
                .then(snapshot => {
                    if(snapshot.empty){
                        Db.collection('Report_'+req.body.pat_hcf).add({
                            patient_id : req.body.patient_id,
                            patient_name : req.body.patientName,
                            patient_email : req.body.patientEmail.toLowerCase(),
                            gender : req.body.pat_gender,
                            state : req.body.pat_state,
                            dob : req.body.pat_dob,
                            patient_phone : req.body.pat_Phone,
                        })
                        .then(ref => {
                            Db.collection('Report_'+req.body.patient_id+'by_hcf').get()
                            .then(snapshot => {
                                if(snapshot.empty){
                                    console.log('Patient Collection Not Found');
                                    Db.collection('Report_'+req.body.patient_id+'by_hcf').add({
                                        hcf_id : req.body.pat_hcf,
                                        hcf_name : req.body.hcf_name,
                                        hcf_email : req.body.hcf_email.toLowerCase(),
                                        hcf_phone : req.body.hcf_phone,
                                        hcf_state : req.body.hcf_state,
                                        hcf_city : req.body.hcf_city,
                                        hcf_address : req.body.hcf_address
                                    })
                                    .then(ref => {

                                    })
                                    .catch(err => {
                                        console.log('Error getting Patient Collection if collection', err);
                                    })
                                }else{
                                    Db.collection('Report_'+req.body.patient_id+'by_hcf').where('hcf_id', '==', req.body.pat_hcf).get() 
                                    .then(snapshot => {
                                        if(snapshot.empty){
                                            Db.collection('Report_'+req.body.patient_id+'by_hcf').add({
                                                hcf_id : req.body.pat_hcf,
                                                hcf_name : req.body.hcf_name,
                                                hcf_email : req.body.hcf_email.toLowerCase(),
                                                hcf_phone : req.body.hcf_phone,
                                                hcf_state : req.body.hcf_state,
                                                hcf_city : req.body.hcf_city,
                                                hcf_address : req.body.hcf_address
                                            })
                                            .then(ref => {
                
                                            })
                                            .catch(err => {
                                                console.log('Error getting Patient Collection first Else collection', err);
                                            })
                                        }
                                    })
                                }
                            })
                        })
                        .catch(err => {
                            console.log('Error creating doc collection', err);
                        });
                    }else{
                        Db.collection('Report_'+req.body.patient_id+'by_hcf').get()
                    .then(snapshot => {
                        if(snapshot.empty){
                            console.log('Patient Collection Not Found');
                            Db.collection('Report_'+req.body.patient_id+'by_hcf').add({
                                hcf_id : req.body.pat_hcf,
                                hcf_name : req.body.hcf_name,
                                hcf_email : req.body.hcf_email.toLowerCase(),
                                hcf_phone : req.body.hcf_phone,
                                hcf_state : req.body.hcf_state,
                                hcf_city : req.body.hcf_city,
                                hcf_address : req.body.hcf_address
                            })
                            .then(ref => {

                            })
                            .catch(err => {
                                console.log('Error getting Patient Collection if collection', err);
                            })
                        }else{
                            Db.collection('Report_'+req.body.patient_id+'by_hcf').where('hcf_id', '==', req.body.pat_hcf).get() 
                            .then(snapshot => {
                                if(snapshot.empty){
                                    Db.collection('Report_'+req.body.patient_id+'by_hcf').add({
                                        hcf_id : req.body.pat_hcf,
                                        hcf_name : req.body.hcf_name,
                                        hcf_email : req.body.hcf_email.toLowerCase(),
                                        hcf_phone : req.body.hcf_phone,
                                        hcf_state : req.body.hcf_state,
                                        hcf_city : req.body.hcf_city,
                                        hcf_address : req.body.hcf_address
                                    })
                                    .then(ref => {
        
                                    })
                                    .catch(err => {
                                        console.log('Error getting Patient Collection first Else collection', err);
                                    })
                                }
                            })
                        }
                    })
                    }
                })
                .catch(err => {
                    console.log('Error getting documents if collection', err);
                  });
            }
        })
        .catch(err => {
            console.log('Error getting documents 1.1st collection', err);
        });
        res.json({status : 'success', msg : 'Saved Successfully', docId : req.body.pat_hcf});
    });
}