
module.exports.uploadDataFile = function(req, res){
    var filepath = '';
    if(req.files[0] != undefined){
        var path = req.files[0].path;
        filepath = path.substr(path.indexOf('/') + 1);
    }
    //'/var/www/shareecare/nodeApp/uploads/'+
    //'/home/ec2-user/Share-e-care-Nodejs/uploads/'+
    let wb = xlsx.readFile('/home/ec2-user/Share-e-care-Nodejs/uploads/'+filepath);
    let ws = wb.Sheets[wb.SheetNames[0]];
    let data = xlsx.utils.sheet_to_json(ws);
    let dataLength = data.length;
    switch (req.body.filetype) {
        case "doctors":
            saveDocData(data, res);
        break;
        case "location":
            saveLocData(data, res);
        break;
        case "proc_sub_proc":
            saveProcedureData(data, res);
        break;
        default:
            res.json({status : 'error', msg : 'Something Went Wrong!'});
        break;
    }
    
}

 async function saveLocData(data, res){
    let state_id;
    let city_id;
    let area_id;
    let maindataarr = [];
    let statedataArr = [];
    let citydataArr = [];
    let areadataArr = [];
    data.forEach((item, index) => {
        if(item["State"] !== undefined){
            state_id = Math.random().toString(36).substr(2, 9);
            city_id = Math.random().toString(36).substr(2, 9);
            area_id = Math.random().toString(36).substr(2, 9);
            statedataArr.push({id : state_id, name : item["State"]});
            citydataArr.push({id : city_id, state_id : state_id, name : item["District/City"]});
            areadataArr.push({id: area_id, city_id : city_id, name : item["Area"], zip_code : item["PinCode"]});
        }else if(item["District/City"] !== undefined){
            city_id = Math.random().toString(36).substr(2, 9);
            area_id = Math.random().toString(36).substr(2, 9);
            citydataArr.push({id : city_id, state_id : state_id, name : item["District/City"]});
            areadataArr.push({id: area_id, city_id : city_id, name : item["Area"], zip_code : item["PinCode"]});
        }else if(item["Area"] !== undefined){
            area_id = Math.random().toString(36).substr(2, 9);
            areadataArr.push({id: area_id, city_id : city_id, name : item["Area"], zip_code : item["PinCode"]});
        }
    });
    statedataArr.forEach((item, index) => {
        Db.collection('States')
        .where('name', '==', item["name"] == undefined ? "" : item["name"])
        .get()
        .then(snapshot => {
            if(snapshot.empty){
                Db.collection('States')
                .add(item)
                .catch(err => {
                    console.log('Error getting documents', err);
                });
            }
        });
    })
    citydataArr.forEach((item, index) => {
        Db.collection('Cities')
        .where('name', '==', item["name"] == undefined ? "" : item["name"])
        .get()
        .then(snapshot => {
            if(snapshot.empty){
                Db.collection('Cities')
                .add(item)
                .catch(err => {
                    console.log('Error getting documents', err);
                });
            }
        });
    })
    areadataArr.forEach((item, index) => {
        Db.collection('Areas')
        .where('name', '==',item["name"] == undefined ? "" : item["name"])
        .where('zip_code', '==', item["zip_code"] == undefined ? "" : item["zip_code"])
        .get()
        .then(snapshot => {
            if(snapshot.empty){
                Db.collection('Areas')
                .add(item)
                .catch(err => {
                    console.log('Error getting documents', err);
                });
            }
        })
    })
    res.json({'states' : statedataArr, cities : citydataArr, areas : areadataArr});return false;
}

function saveDocData(data, res){
    data.forEach((item, index) => {
        Db.collection('Doctors')
        .where('REGISTRATION DATE', '==', item['REGISTRATION DATE'] == undefined ? "" : item['REGISTRATION DATE'])
        .where('LICENSE ID', '==', item['LICENSE ID'] == undefined ? "" : item['LICENSE ID'])
        .where('YEAR OF PASSING', '==', item['YEAR OF PASSING'] == undefined ? "" : item['YEAR OF PASSING'])
        .where('REGISTRATION NUMBER', '==', item['REGISTRATION NUMBER'] == undefined ? "" : item['REGISTRATION NUMBER'])
        .get()
        .then(snapshot => {
            if(snapshot.empty){
                Db.collection('Doctors')
                .add(item)
                .then(ref => {})
                .catch(err => {
                    console.log('Error getting documents', err);
                });
            }
        })
        .catch(err => {
            console.log('Error getting documents', err);
        })
    })  
    res.json({status : 'success', msg : 'Saved Successfully'});
}

function saveLocationData(data, res){
    let locationData = modifyLocationData(data);
    //console.log(locationData);
    //  res.json({status : 'success', locationData : locationData});return false;
    locationData.forEach((item1, index) => {
        saveStateData(item1, res);
    })  
    res.json({status : 'success', msg : 'Saved Successfully'});
}


function saveProcedureData(data, res){
    let procedureData = modifyProcedureData(data);
    //console.log(procedureData);
    //res.json({status : 'success', locationData : procedureData});return false;
    procedureData.forEach((item1, index) => {
        saveProcData(item1, res);
    })  
    res.json({status : 'success', msg : 'Saved Successfully'});
}

function modifyProcedureData(data){
    let procedureData = [];
    let procObj;
    let proc_id;
    let sub_proc_id;
    data.forEach((item, index) => {
        if(item["PROCEDURE"] !== undefined){
            if(procObj !== undefined && procObj !== null){
                procedureData.push(procObj);
            }
            proc_id = Math.random().toString(36).substr(2, 9);
            sub_proc_id = Math.random().toString(36).substr(2, 9);
            procObj = {};
            procObj.id = proc_id;
            procObj.procedureName = item["PROCEDURE"];
            procObj.sub_proc = [];
            procObj.sub_proc.push({id : sub_proc_id, pId : proc_id, subProcedureName : item["SUB PROCEDURE"]});
        }else if(item["SUB PROCEDURE"] !== undefined){
            sub_proc_id = Math.random().toString(36).substr(2, 9);
            procObj.sub_proc.push({id : sub_proc_id, pId : proc_id, subProcedureName : item["SUB PROCEDURE"]});
        }
    })
    if(procObj !== undefined && procObj !== null){
        procedureData.push(procObj);
    }
    return procedureData;
}

function saveProcData(item1, res){
    let dataObj = {
        id : item1.id,
        procedureName : item1.procedureName,
    };
    Db.collection('Procedures')
    .where('procedureName', '==', dataObj['procedureName'] == undefined ? "" : dataObj['procedureName'])
    .get()
    .then(snapshot => {
        if(snapshot.empty){
            Db.collection('Procedures')
            .add(dataObj)
            .then(ref => {
                item1.sub_proc.forEach((item2, index) => {
                    saveSubProcData(item2, res);
                })
            })
            .catch(err => {
                console.log('Error getting documents', err);
                //res.json({status : 'error', msg : 'Something Went Wrong'});
            });
        }
    })
    .catch(err => {
        console.log('Error getting documents', err);
        //res.json({status : 'error', msg : 'Something Went Wrong'});
        
    })
}

function saveSubProcData(item2, res){
    let dataObj = {
        id : item2.id,
        pId : item2.pId,
        subProcedureName : item2.subProcedureName,
    };
    Db.collection('Sub Procedures')
    .where('subProcedureName', '==', dataObj['subProcedureName'] == undefined ? "" : dataObj['subProcedureName'])
    .get()
    .then(snapshot => {
        if(snapshot.empty){
            Db.collection('Sub Procedures')
            .add(dataObj)
            .then(ref => {
                //console.log(index);
                //console.log(ref);
                // res.json({status : 'success', msg : 'Saved Successfully'});
            })
            .catch(err => {
                console.log('Error getting documents', err);
                //res.json({status : 'error', msg : 'Something Went Wrong'});
            });
        }
    })
    .catch(err => {
        console.log('Error getting documents', err);
        //res.json({status : 'error', msg : 'Something Went Wrong'});
        
    })
}

module.exports.addAdminPlans = function(req, res){
    console.log(req.body); 
    if(req.body.docId != undefined && req.body.docId != ""){
        Db.collection('Admin_subscription_plans').doc(req.body.docId).update(req.body).then(ref => {
            // var resObj = {status : 'success', msg : 'updated Successfully', docId : req.body.docId};
            res.json({status : 'success', msg : 'updated Successfully', docId : ref.id});
        })  
        .catch(err => {
            console.log('Error getting documents', err);
        });
    }else{
        Db.collection('Admin_subscription_plans').add(req.body).then(ref => {
            res.json({status : 'success', msg : 'Saved Successfully', docId : ref.id});
        });
    }
    
}
module.exports.saveAdminSettings = function(req, res){
    console.log(req.body);
    Db.collection('admin_settings').doc(req.body.settingDocId).set({
        drcommision : req.body.drcommision,
        shareCount : req.body.shareCount
    }).then(ref => {
        console.log(ref);
        res.json({status : 'success', msg : 'Saved Successfully'});
    });
}

module.exports.getAdminPlans = function(req, res){
    var plan = [];
    Db.collection('Admin_subscription_plans').get()
    .then(snapshot => {
        if(snapshot.empty){
            res.json({status : 'error', msg : 'No Plan Found!'});
        }else{
            snapshot.forEach(doc => {
                var tempArr = doc.data();
                tempArr.docId = doc.id;
                plan.push(tempArr);
            });
            res.json({status : 'success', msg : 'Plans Found!', plan_data : plan});
        }
    })
    .catch(err => {
        console.log('Error getting documents', err);
    })
}

module.exports.delAdminPlan = function (req, res) {
    console.log(req.body);
    Db.collection("Admin_subscription_plans").doc(req.body.planId).delete().then(ref => {
        console.log("Plan successfully deleted!");
        res.json({status : 'success', msg : 'Plan successfully deleted', docId : req.body.planId});
    }).catch(function(error) {
        console.error("Error removing document: ", error);
    });
}
module.exports.getAdminSettings = function(req, res){
    Db.collection('admin_settings').get()
    .then(snapshot => {
        let shareCount = [];
      snapshot.forEach(doc => {
        var tempArr = doc.data();
        tempArr.docId = doc.id;
        shareCount = tempArr;
      });
      res.json({status : 'success', msg : 'Share Count Found!', adminSetting : shareCount});
    }).catch(err => {
        console.log('Error getting documents', err);
    })

}

module.exports.getCountForAdmin = function(req, res){
    var dataCount = [];
    var data      = new Object();
    Db.collection('Patients').get().then(snap => {
        data.patientCount   = snap.size;
        Db.collection('Patients').where('addedByType', '==', 'hcf').get().then(snap => {
            data.patientbyHcfCount   = snap.size;
            Db.collection('Patients').where('addedByType', '==', 'doctor').get().then(snap => {
                data.patientbyproviderCount   = snap.size;  
            })
        })
        Db.collection('Providers').get().then(snap => {
            data.providerCount   = snap.size;
            Db.collection('Health_care_facility').get().then(snap => {
                data.hcfCount   = snap.size;
                Db.collection('PatientResults').get().then(snap => {
                    data.reportsCount   = snap.size;  
                    dataCount.push(data);
                    res.json({status : 'success', dataCount : dataCount});
                    console.log('data ', dataCount);
                })
            });
        });
    });  
}


module.exports.changePaymentStatus = function (req, res) {
    console.log(req.body);
    // return false;
    Db.collection('Report_'+req.body.doctor_id+'_bypat').doc(req.body.docId).update({
        status : req.body.status
    })
    .then(ref => {
        // save log
        // let msgobj = {
        //     msg : 'Payment status changed by Doctor',
        //     id : req.body.doctor_id,
        //     colec : 'Providers'
        // }
        // common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Status Updated Successfully' });
    })
}

module.exports.getDoctorlistByPatId = function (req, res){
    console.log(req.query);
    var doctors = [];
  Db.collection('Report_'+req.query.patient_id).get()
  .then(snapshot => {
      if (snapshot.empty) {
              res.json({status : 'error', msg : 'No doctors Found!'});
      }else{
          snapshot.forEach(doc => {
              var tempArr = doc.data();
              tempArr.docId = doc.id;
              doctors.push(tempArr);
          });
          res.json({status : 'success', msg : 'doctors Found!', doctors_data : doctors});
      }  
      
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });
}

module.exports.getPatientByType = function (req, res){
    console.log(req.query);
    var patients = [];
    if(req.query.type == 'doctor'){
        var condition = 'doctor_id';
    }else{
        condition = 'hcf_id';
    }
    Db.collection('Patients').where('addedByType', '==', req.query.type).where(condition, '==', req.query.id).get()
    .then(snapshot => {
        if (snapshot.empty) {
                res.json({status : 'error', msg : 'No Patient Found!'});
        }else{
            snapshot.forEach(doc => {
                var tempArr = doc.data();
                tempArr.docId = doc.id;
                patients.push(tempArr);
            });
            res.json({status : 'success', msg : 'Patients Found!', patients_data : patients});
        }  
        
    })
    .catch(err => {
      console.log('Error getting documents', err);
    });
}

module.exports.getUnverifiedDoctors = function(req, res){
    var unverifiedDoctors = [];
    Db.collection('Providers').where('crossCheck', '==', false).get()
    .then(snapshot => {
        if (snapshot.empty) {
            res.json({status : 'error', msg : 'No Doctor Found.'});
        }else{
            snapshot.forEach(doc => {
                snapshot.forEach(doc => {
                    var tempArr = doc.data();
                    tempArr.docId = doc.id;
                    console.log(tempArr);
                    unverifiedDoctors.push(tempArr);
                })
                res.json({status : 'success', msg : 'Record Found!', unverifiedDoctors : unverifiedDoctors});
            });
            
        }
    })
    .catch(err => {
        console.log('Error getting documents', err);
    });
}

module.exports.verifyDoctor = function (req, res){
    console.log(req.query);
    Db.collection('Providers').doc(req.query.id).update({
        crossCheck : true
    }).then(ref => {
        res.json({status : 'success', msg : 'Status Updated Successfully' });
    }); 
}
module.exports.blockDoctor = function (req, res){
    console.log(req.query);
    var action;
    if(req.query.action == 'block'){
        action = false;
    }else{
        action = true;
    }
    Db.collection('Providers').doc(req.query.id).update({
        approved : action
    }).then(ref => {
        res.json({status : 'success', msg : 'Blocked Successfully' });
    }); 
}