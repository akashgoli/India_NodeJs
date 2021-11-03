// var nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');
AWS.config.update({region: 'ap-south-1'});
module.exports.get_states = function (req, res) {
  console.log(req.body);
  var states = [];
  Db.collection("States")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No States Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          states.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "States Found!",
          states_data: states,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.get_cities = function (req, res) {
  console.log(req.query);
  var state_id = req.query.state_id;
  var cities = [];
  Db.collection("Cities")
    .where("state_id", "==", state_id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Cities Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          cities.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Cities Found!",
          cities_data: cities,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.get_areas = function (req, res) {
  console.log(req.query);
  var city_id = req.query.city_id;
  var areas = [];
  Db.collection("Areas")
    .where("city_id", "==", city_id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Areas Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          areas.push(tempArr);
        });
        res.json({ status: "success", msg: "Areas Found!", areas_data: areas });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.get_specialties = function (req, res) {
  var specialties = [];
  Db.collection("Specialties")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Specialties Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          specialties.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Specialties Found!",
          specialties_data: specialties,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.getsubscriptioplans = function (req, res) {
  console.log(req.query);
  var doctor_id = req.query.doctor_id;
  var plans = [];
  Db.collection("Doc_fee_plans")
    .where("doctor_id", "==", doctor_id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({
          status: "error",
          msg: "No Plans Found!",
          plans_data: plans,
        });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          plans.push(tempArr);
        });
        res.json({ status: "success", msg: "Plans Found!", plans_data: plans });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};
adminCount = 3;
module.exports.getsubscriptioplansByRole = function (req, res) {
  console.log(req.query);
  var doctor_id = req.query.doctor_id;
  var patient_id = req.query.patient_id;
  var report_id = req.query.report_id;
  //console.log(doctor_id, patient_id, report_id);
  //return false;
  Db.collection("admin_settings")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        var tempArr = doc.data();
        this.adminCount = tempArr.shareCount;
      });
      console.log(this.adminCount);
      Db.collection("Report_" + doctor_id + "_bypat")
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            res.json({
              status: "success",
              adminCount: this.adminCount,
              sharedCount: this.adminCount,
              remainingCount: 0,
            });
          } else {
            Db.collection("Report_" + doctor_id + "_bypat")
              .where("test_id", "==", report_id)
              .get()
              .then((snapshot) => {
                if (snapshot.empty) {
                  res.json({
                    status: "success",
                    adminCount: this.adminCount,
                    sharedCount: this.adminCount,
                    remainingCount: 0,
                  });
                } else {
                  let sharedCount = 0;
                  let remainingCount = 0;
                  let objs = [];
                  snapshot.forEach((doc) => {
                    var tempArr = doc.data();
                    objs.push(tempArr);
                  });
                  objs.sort(function (a, b) {
                    return b.shareDate._seconds - a.shareDate._seconds;
                  });
                  sharedCount = objs[0].sharedCount;
                  remainingCount = objs[0].remainingCount;
                  //console.log(objs);
                  res.json({
                    status: "success",
                    adminCount: this.adminCount,
                    sharedCount: sharedCount,
                    remainingCount: remainingCount,
                  });
                }
              })
              .catch((err) => {
                console.log("Error getting documents", err);
              });
          }
        })
        .catch((err) => {
          console.log("Error getting documents", err);
        });
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.getPatientByEmail = function (req, res) {
  console.log(req.query);
  var patient_email = req.query.patient_email.toLowerCase();
  var patient = [];
  Db.collection("Patients")
    .where("email", "==", patient_email)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Patient Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          patient.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Patients Found!",
          patientData: patient,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting Results", err);
    });
};

module.exports.getDoctorByEmail = function (req, res) {
  console.log(req.query);
  var doctor_email = req.query.doctor_email.toLowerCase();
  var doctor = [];
  Db.collection("Providers")
    .where("email", "==", doctor_email)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Doctor Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          doctor.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Doctor Found!",
          drData: doctor,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting Results", err);
    });
};

module.exports.getHcfByEmail = function (req, res) {
  console.log(req.query);
  var hcf_emil = req.query.hcf_email.toLowerCase();
  var hcf = [];
  Db.collection("Health_care_facility")
    .where("email", "==", hcf_emil)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Facility Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          hcf.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Patients Found!",
          hcf_data: hcf,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting Results", err);
    });
};

// Adding Patients by Doc and HCF from their dashboards
module.exports.addNewPat = function (req, res) {
  console.log(req.body);
  Db.collection("Patients")
    .where("email", "==", req.body.email.toLowerCase())
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        req.body.canLogin = false;
        req.body.showStep = 3;
        req.body.resultShareCount = 0;
        let addDoc = Db.collection("Patients")
          .add(req.body)
          .then((ref) => {
            console.log(ref);
            // save log
            let msgobj = {
              msg: "Patient Added by " + req.body.addedByType,
              id:
                req.body.addedByType == "hcf"
                  ? req.body.hcf_id
                  : req.body.doctor_id,
              colec:
                req.body.addedByType == "hcf"
                  ? "Health_care_facility"
                  : "Providers",
            };
            saveLogFunc(msgobj);
            // save log
            res.json({
              status: "success",
              msg: "Saved Successfully",
              docId: ref.id,
            });
          });
      } else {
        snapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
          res.json({
            status: "error",
            msg: req.body.email + " already exists.",
            docId: doc.id,
          });
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};
// Adding Patients by Doc and HCF from their dashboards

// Getting Patients by Doc and HCF
module.exports.getmypatients = function (req, res) {
  console.log(req.query);
  var id = req.query.id;
  // console.log(doctor_id);
  var conditionForGettingPat = "";
  if (req.query.type == "hcf") {
    conditionForGettingPat = "hcf_id";
  } else {
    conditionForGettingPat = "doctor_id";
  }
  var Patients = [];
  Db.collection("Patients")
    .where(conditionForGettingPat, "==", id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Patients Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          Patients.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Patients Found!",
          patients_data: Patients,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};
// Getting Patients by Doc and HCF

// Getting Reports of single patient
module.exports.getPatientResults = function (req, res) {
  console.log(req.query);
  var id = req.query.resultById;
  var condition = "";
  if (req.query.type == "pat") {
    condition = "patient_id";
  } else if (req.query.type == "hcf") {
    condition = "pat_hcf";
  } else if (req.query.type == "hcf_member") {
    condition = "hcf_member_id";
  }
  var PatientResults = [];
  Db.collection("PatientResults")
    .where(condition, "==", id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Plans Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          PatientResults.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Results Found!",
          PatientResultsData: PatientResults,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting Results", err);
    });
};
// Getting Reports of single patient

module.exports.getResultsbyDoctor = function (req, res) {
  console.log(req.query);
  var doctor_id = req.query.doctor_id;
  console.log(doctor_id);
  var PatientResults = [];
  Db.collection("Report_" + doctor_id + "_bypat")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Results Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          PatientResults.push(tempArr);
        });
        PatientResults.sort(function (a, b) {
          return b.shareDate._seconds - a.shareDate._seconds;
        });
        res.json({
          status: "success",
          msg: "Results Found!",
          results_Data: PatientResults,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting Results", err);
    });
};

module.exports.getDoctorList = function (req, res) {
  console.log(req.query);
  var physicians = [];
  Db.collection("Providers")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Physicians Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          physicians.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Physicians Found!",
          physicians_data: physicians,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.getDoctorListByFilter = function (req, res) {
  console.log("hellooo", req.body);
  let specialty_id = req.body.specialty.split("__")[0];
  // console.log(state_id, city_id, specialty_id);
  var physicians = [];
  Db.collection("Providers")
    .where("state", "==", req.body.state)
    .where("city", "==", req.body.city)
    .where("specialty", "==", specialty_id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Physicians Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          physicians.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Physicians Found!",
          physicians_data: physicians,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.findProvider = function (req, res) {
  console.log(req.body);
  let state_id = req.body.state.split("__")[0];
  let city_id = req.body.city.split("__")[0];
  let area_id = req.body.area.split("__")[0];
  let specialty_id = req.body.specialty.split("__")[0];
  var providers = [];
  Db.collection("Providers")
    .where("state", "==", state_id)
    .where("city", "==", city_id)
    .where("area", "==", area_id)
    .where("specialty", "==", specialty_id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No providers Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          providers.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "providers Found!",
          providers_data: providers,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.findFacility = function (req, res) {
  let state_id = req.body.state.split("__")[0];
  let city_id = req.body.city.split("__")[0];
  let area_id = req.body.area.split("__")[0];
  // let specialty_id = req.params.specialty.split('__')[0];
  var facilities = [];
  Db.collection("Health_care_facility")
    .where("state", "==", state_id)
    .where("city", "==", city_id)
    .where("area", "==", area_id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Facility Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          facilities.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Facilities Found!",
          facilities_data: facilities,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};
module.exports.getProcList = function (req, res) {
  console.log(req.query);
  var procedures = [];
  Db.collection("Procedures")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Procedures Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          procedures.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Procedures Found!",
          procedures_data: procedures,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.getSubProcList = function (req, res) {
  console.log(req.query);
  var subProcedures = [];
  Db.collection("Sub Procedures")
    .where("pId", "==", req.query.proc_id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Sub Procedures Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          subProcedures.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Sub Procedures Found!",
          subProcedures_data: subProcedures,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.getPatientList = function (req, res) {
  console.log(req.query);
  var pats = [];
  Db.collection("Patients")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Patients Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          pats.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Patients Found!",
          pats_data: pats,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.getHcfList = function (req, res) {
  console.log(req.query);
  var city = req.query.city;
  var facilities = [];
  Db.collection("Health_care_facility")
    .where("city", "==", city)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Facilities Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          facilities.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Facilities Found!",
          facilities_data: facilities,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};
module.exports.getHcfListOfPat = function (req, res) {
  console.log(req.query);
  var facilities = [];
  
  Db.collection('Report_'+req.query.patientId+'by_hcf')
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Facilities Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          facilities.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Facilities Found!",
          facilities_data: facilities,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
}
module.exports.getAllHcfList = function (req, res) {
  var facilities = [];
  Db.collection("Health_care_facility")
    .where("canLogin", "==", true)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Facilities Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          facilities.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Facilities Found!",
          facilities_data: facilities,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.saveNewMsg = function (req, res) {
  var chat_id =
    req.body.chat_id || req.body.from_docId + "__" + req.body.to_docId;
  req.body.chat_id = chat_id;
  console.log(req.body);
  Db.collection(req.body.from_docId)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log("empty");
        Db.collection(req.body.from_docId)
          .doc(chat_id)
          .set({
            from_docId: req.body.from_docId,
            from_name: req.body.from_name,
            to_docId: req.body.to_docId,
            to_name: req.body.to_name,
            message: req.body.message,
            date: req.body.date,
            chat_id: chat_id,
          })
          .then((ref) => {
            //console.log(ref);
            Db.collection(req.body.to_docId)
              .doc(chat_id)
              .set({
                to_docId: req.body.from_docId,
                to_name: req.body.from_name,
                from_docId: req.body.to_docId,
                from_name: req.body.to_name,
                message: req.body.message,
                date: req.body.date,
                chat_id: chat_id,
              })
              .then((ref) => {
                Db.collection(chat_id)
                  .add({
                    from_docId: req.body.from_docId,
                    message: req.body.message,
                    date: req.body.date,
                  })
                  .then((ref) => {
                    //console.log(ref);
                    res.json({
                      status: "success",
                      msg: "Saved Successfully",
                      chat_id: chat_id,
                    });
                  })
                  .catch((err) => {
                    console.log("Error getting documents 2nd collection", err);
                  });
              })
              .catch((err) => {
                console.log("Error getting documents 1.1st collection", err);
              });
          })
          .catch((err) => {
            console.log("Error getting documents 1st collection", err);
          });
      } else {
        console.log("NOTempty");
        Db.collection(req.body.from_docId)
          .where("chat_id", "==", chat_id)
          .get()
          .then((snapshot) => {
            if (snapshot.empty) {
              Db.collection(req.body.from_docId)
                .doc(chat_id)
                .set({
                  from_docId: req.body.from_docId,
                  from_name: req.body.from_name,
                  to_docId: req.body.to_docId,
                  to_name: req.body.to_name,
                  message: req.body.message,
                  date: req.body.date,
                  chat_id: chat_id,
                })
                .then((ref) => {
                  Db.collection(req.body.to_docId)
                    .doc(chat_id)
                    .set({
                      to_docId: req.body.from_docId,
                      to_name: req.body.from_name,
                      from_docId: req.body.to_docId,
                      from_name: req.body.to_name,
                      message: req.body.message,
                      date: req.body.date,
                      chat_id: chat_id,
                    })
                    .then((ref) => {
                      //console.log(ref);
                      Db.collection(chat_id)
                        .add({
                          from_docId: req.body.from_docId,
                          message: req.body.message,
                          date: req.body.date,
                        })
                        .then((ref) => {
                          //console.log(ref);
                          res.json({
                            status: "success",
                            msg: "Saved Successfully",
                            chat_id: chat_id,
                          });
                        })
                        .catch((err) => {
                          console.log(
                            "Error getting documents 2nd collection",
                            err
                          );
                        });
                    })
                    .catch((err) => {
                      console.log(
                        "Error getting documents 1st collection",
                        err
                      );
                    });
                })
                .catch((err) => {
                  console.log("Error getting documents 1st collection", err);
                });
            } else {
              Db.collection(req.body.from_docId)
                .doc(chat_id)
                .update({ message: req.body.message })
                .then((ref) => {
                  Db.collection(req.body.to_docId)
                    .doc(chat_id)
                    .update({ message: req.body.message })
                    .then((ref) => {
                      //console.log(ref);
                      Db.collection(chat_id)
                        .add({
                          from_docId: req.body.from_docId,
                          message: req.body.message,
                          date: req.body.date,
                        })
                        .then((ref) => {
                          //console.log(ref);
                          res.json({
                            status: "success",
                            msg: "Saved Successfully",
                            chat_id: chat_id,
                          });
                        })
                        .catch((err) => {
                          console.log(
                            "Error getting documents 2nd collection",
                            err
                          );
                        });
                    })
                    .catch((err) => {
                      console.log(
                        "Error getting documents 1st collection",
                        err
                      );
                    });
                })
                .catch((err) => {
                  console.log("Error getting documents 1st collection", err);
                });
            }
          })
          .catch((err) => {
            console.log("Error getting documents", err);
          });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.getuserData = function (req, res) {
  console.log(req.query);
  var user_data = [];
  var collection = "";
  if (req.query.type == "patient") {
    collection = "Patients";
  } else if (req.query.type == "doctor" || req.query.type == "assignedTo") {
    collection = "Providers";
  } else if (req.query.type == "hcf") {
    collection = "Health_care_facility";
  }
  Db.collection(collection)
    .where("docId", "==", req.query.id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No User Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          user_data.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "User Found!",
          user_data: user_data,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.downloadFile = function (req, res) {
  console.log(req.body);
  filepath = path.join(__dirname, "../uploads/" + req.body.filepath);
  console.log(filepath);
  res.sendFile(filepath);
};

module.exports.checkcollection = function (req, res) {
  console.log(req.query);
  var data = [];
  Db.collection("Report_" + req.query.patient_id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Colection" });
      } else {
        Db.collection("Report_" + req.query.patient_id)
          .where("doctor_id", "==", req.query.doctor_id)
          .get()
          .then((snapshot) => {
            if (snapshot.empty) {
              res.json({ status: "errors", msg: "No Doctor Found" });
            } else {
              snapshot.forEach((doc) => {
                var tempArr = doc.data();
                data.push(tempArr);
              });
              res.json({
                status: "success",
                msg: "Collection Found",
                collection_data: data,
              });
            }
          });
      }
    });
};

module.exports.share_with_doctor = function (req, res) {
  // console.log(req.body); return false;
  drCommisionbyAdmin = 0;
  calculatedDrComm = 0;
  CalculatedAdminCom = 0;
  canShow = false;
  Db.collection("admin_settings")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        var tempArr = doc.data();
        console.log(doc.data());
        this.drCommisionbyAdmin = tempArr.drcommision;
      });
      if (req.body.package_Price == "0.00") {
        console.log("price 0");
        this.calculatedDrComm = 0;
        this.CalculatedAdminCom = 0;
        this.canShow = false;
      } else {
        console.log("price is not 0" + req.body.package_Price);
        var price = parseInt(req.body.package_Price);
        var comm = parseInt(this.drCommisionbyAdmin) / 100;

        this.calculatedDrComm = price - price * comm;
        this.CalculatedAdminCom = price - this.calculatedDrComm;
        this.canShow = true;
      }
      console.log(
        "Dr Comm" +
          this.drCommisionbyAdmin +
          " And Cal Dr Comm " +
          this.calculatedDrComm +
          " and Admin Com " +
          this.CalculatedAdminCom
      );
    });

  Db.collection("Report_" + req.body.patient_info.docId)
    .get()
    .then((snapshot) => {
      console.log("checkpoint 1");
      if (snapshot.empty) {
        console.log("checkpoint 2");
        Db.collection("Report_" + req.body.patient_info.docId)
          .add({
            doctor_id: req.body.doctor_info.docId,
            doctor_lname: req.body.doctor_info.lname,
            doctor_fname: req.body.doctor_info.fname,
            gender: req.body.doctor_info.gender,
            state: req.body.doctor_info.state_name,
            dob: req.body.doctor_info.dob,
          })
          .then((ref) => {
            console.log("checkpoint 3");
            Db.collection("Report_" + req.body.doctor_info.docId)
              .get()
              .then((snapshot) => {
                console.log("checkpoint 4");
                if (snapshot.empty) {
                  console.log("checkpoint 5");
                  Db.collection("Report_" + req.body.doctor_info.docId)
                    .add({
                      patient_id: req.body.patient_info.docId,
                      patient_lname: req.body.patient_info.lname,
                      patient_fname: req.body.patient_info.fname,
                      gender: req.body.patient_info.gender,
                      state: req.body.patient_info.state_name,
                      dob: req.body.patient_info.dob,
                      email: req.body.patient_info.email.toLowerCase(),
                      phone_num:
                        req.body.patient_info.mobileNo.internationalNumber,
                    })
                    .then((ref) => {
                      console.log("checkpoint 6");
                      Db.collection(
                        "Report_" + req.body.doctor_info.docId + "_bypat"
                      )
                        .add({
                          patient_id: req.body.patient_info.docId,
                          patient_lname: req.body.patient_info.lname,
                          patient_fname: req.body.patient_info.fname,
                          gender: req.body.patient_info.gender,
                          planName: req.body.package_name,
                          plan_price: req.body.package_Price,
                          testName: req.body.report.testName,
                          procedure: req.body.report.procedure,
                          created_date: req.body.report.created_date,
                          test_id: req.body.report.docId,
                          reportfiles: req.body.report.reportFile,
                          shareDate: new Date(),
                          sharedCount: req.body.sharedCount,
                          remainingCount: req.body.remainingCount,
                          calDrComission: this.calculatedDrComm,
                          calAdminComm: this.CalculatedAdminCom,
                          canShowNow: this.canShow,
                          status: "unpaid",
                          statusByDr : "in-progress"
                        })
                        .then((ref) => {
                          console.log("checkpoint 7");
                          Db.collection("PatientResults")
                            .doc(req.body.report.docId)
                            .update({
                              sharedWithDrsCount: req.body.sharedWithDrsCount,
                            })
                            .then((ref) => {
                              console.log("checkpoint 8");
                              // save log
                              let msgobj = {
                                msg: "Patient shared result with Doctor",
                                id: req.body.patient_info.docId,
                                colec: "Patients",
                              };
                              saveLogFunc(msgobj);
                              // save log
                              res.json({
                                status: "success",
                                msg: "Result Share Successfully",
                                docId: req.body.patient_info.docId,
                              });
                            })
                            .catch((err) => {
                              console.log(
                                "Error Saving Patien Share Count 1",
                                err
                              );
                            });
                        })
                        .catch((err) => {
                          console.log(
                            "Error getting collectionId collection",
                            err
                          );
                        });
                    });
                } else {
                  console.log("checkpoint 19");
                  Db.collection("Report_" + req.body.doctor_info.docId)
                  .where("patient_id", "==", req.body.patient_info.docId)
                  .get()
                  .then((snapshot) => {
                    console.log('checkpoint 1A');
                    Db.collection("Report_" + req.body.doctor_info.docId)
                    .add({
                      patient_id: req.body.patient_info.docId,
                      patient_lname: req.body.patient_info.lname,
                      patient_fname: req.body.patient_info.fname,
                      gender: req.body.patient_info.gender,
                      state: req.body.patient_info.state,
                      dob: req.body.patient_info.dob,
                      email: req.body.patient_info.email.toLowerCase(),
                      phone_num:
                        req.body.patient_info.mobileNo.internationalNumber,
                    })
                    .then((ref) => {
                      console.log("checkpoint 1B");
                      Db.collection(
                        "Report_" + req.body.doctor_info.docId + "_bypat"
                      )
                        .add({
                          patient_id: req.body.patient_info.docId,
                          patient_lname: req.body.patient_info.lname,
                          patient_fname: req.body.patient_info.fname,
                          gender: req.body.patient_info.gender,
                          planName: req.body.package_name,
                          plan_price: req.body.package_Price,
                          testName: req.body.report.testName,
                          procedure: req.body.report.procedure,
                          created_date: req.body.report.created_date,
                          test_id: req.body.report.docId,
                          reportfiles: req.body.report.reportFile,
                          shareDate: new Date(),
                          sharedCount: req.body.sharedCount,
                          remainingCount: req.body.remainingCount,
                          calDrComission: this.calculatedDrComm,
                          calAdminComm: this.CalculatedAdminCom,
                          canShowNow: this.canShow,
                          status: "unpaid",
                          statusByDr : "in-progress"
                        })
                        .then((ref) => {
                          console.log("checkpoint 1C");
                          Db.collection("PatientResults")
                            .doc(req.body.report.docId)
                            .update({
                              sharedWithDrsCount: req.body.sharedWithDrsCount,
                            })
                            .then((ref) => {
                              console.log("checkpoint 1D");
                              // save log
                              let msgobj = {
                                msg: "Patient shared result with Doctor",
                                id: req.body.patient_info.docId,
                                colec: "Patients",
                              };
                              saveLogFunc(msgobj);
                              // save log
                              res.json({
                                status: "success",
                                msg: "Result Share Successfully",
                                docId: req.body.patient_info.docId,
                              });
                            })
                            .catch((err) => {
                              console.log(
                                "Error Saving Patien Share Count 1",
                                err
                              );
                            });
                        })
                        .catch((err) => {
                          console.log(
                            "Error getting collectionId collection",
                            err
                          );
                        });
                    });
                  })
                  // Db.collection(
                  //   "Report_" + req.body.doctor_info.docId + "_bypat"
                  // )
                  //   .add({
                  //     patient_id: req.body.patient_info.docId,
                  //     patient_lname: req.body.patient_info.lname,
                  //     patient_fname: req.body.patient_info.fname,
                  //     gender: req.body.patient_info.gender,
                  //     planName: req.body.package_name,
                  //     plan_price: req.body.package_Price,
                  //     testName: req.body.report.testName,
                  //     procedure: req.body.report.procedure,
                  //     created_date: req.body.report.created_date,
                  //     test_id: req.body.report.docId,
                  //     reportfiles: req.body.report.reportFile,
                  //     shareDate: new Date(),
                  //     sharedCount: req.body.sharedCount,
                  //     remainingCount: req.body.remainingCount,
                  //     calDrComission: this.calculatedDrComm,
                  //     calAdminComm: this.CalculatedAdminCom,
                  //     canShowNow: this.canShow,
                  //     status: "unpaid",
                  //     statusByDr : "in-progress"
                  //   })
                  //   .then((ref) => {
                  //     console.log("checkpoint 20");
                  //     Db.collection("PatientResults")
                  //       .doc(req.body.report.docId)
                  //       .update({
                  //         sharedWithDrsCount: req.body.sharedWithDrsCount,
                  //       })
                  //       .then((ref) => {
                  //         console.log("checkpoint 21");
                  //         res.json({
                  //           status: "success",
                  //           msg: "Result Share Successfully",
                  //           docId: req.body.patient_info.docId,
                  //         });
                  //       })
                  //       .catch((err) => {
                  //         console.log("Error Saving Patien Share Count 1", err);
                  //       });
                  //   })
                  //   .catch((err) => {
                  //     console.log("Error getting collectionId collection", err);
                  //   });
                }
              })
              .catch((err) => {
                console.log("Error getting documents 2.2nd collection", err);
              });
          })
          .catch((err) => {
            console.log("Error getting documents 1.1st collection", err);
          });
      } else {
        console.log("checkpoint 9");
        console.log("Found");
        Db.collection("Report_" + req.body.patient_info.docId)
          .where("doctor_id", "==", req.body.doctor_info.docId)
          .get()
          .then((snapshot) => {
            console.log("checkpoint 10");
            if (snapshot.empty) {
              Db.collection("Report_" + req.body.patient_info.docId)
                .add({
                  doctor_id: req.body.doctor_info.docId,
                  doctor_lname: req.body.doctor_info.lname,
                  doctor_fname: req.body.doctor_info.fname,
                  gender: req.body.doctor_info.gender,
                  state: req.body.doctor_info.state_name,
                  dob: req.body.doctor_info.dob,
                })
                .then((ref) => {
                  console.log("checkpoint 11");
                  Db.collection("Report_" + req.body.doctor_info.docId)
                    .get()
                    .then((snapshot) => {
                      console.log("checkpoint 12");
                      if (snapshot.empty) {
                        console.log("checkpoint 13");
                        Db.collection("Report_" + req.body.doctor_info.docId)
                          .add({
                            patient_id: req.body.patient_info.docId,
                            patient_lname: req.body.patient_info.lname,
                            patient_fname: req.body.patient_info.fname,
                            gender: req.body.patient_info.gender,
                            state: req.body.patient_info.state_name,
                            dob: req.body.patient_info.dob,
                            email: req.body.patient_info.email.toLowerCase(),
                            phone_num:req.body.patient_info.mobileNo.internationalNumber,
                          })
                          .then((ref) => {
                            console.log("checkpoint 14");
                            Db.collection(
                              "Report_" + req.body.doctor_info.docId + "_bypat"
                            )
                              .add({
                                patient_id: req.body.patient_info.docId,
                                patient_lname: req.body.patient_info.lname,
                                patient_fname: req.body.patient_info.fname,
                                gender: req.body.patient_info.gender,
                                planName: req.body.package_name,
                                plan_price: req.body.package_Price,
                                testName: req.body.report.testName,
                                procedure: req.body.report.procedure,
                                created_date: req.body.report.created_date,
                                test_id: req.body.report.docId,
                                reportfiles: req.body.report.reportFile,
                                shareDate: new Date(),
                                sharedCount: req.body.sharedCount,
                                remainingCount: req.body.remainingCount,
                                calDrComission: this.calculatedDrComm,
                                calAdminComm: this.CalculatedAdminCom,
                                canShowNow: this.canShow,
                                status: "unpaid",
                                statusByDr : "in-progress"
                              })
                              .then((ref) => {
                                console.log("checkpoint 15");
                                Db.collection("PatientResults")
                                  .doc(req.body.report.docId)
                                  .update({
                                    sharedWithDrsCount:
                                      req.body.sharedWithDrsCount,
                                  })
                                  .then((ref) => {
                                    console.log("checkpoint 16");
                                    // save log
                                    let msgobj = {
                                      msg: "Patient shared result with Doctor",
                                      id: req.body.patient_info.docId,
                                      colec: "Patients",
                                    };
                                    saveLogFunc(msgobj);
                                    // save log
                                    res.json({
                                      status: "success",
                                      msg: "Result Share Successfully",
                                      docId: req.body.patient_info.docId,
                                    });
                                  })
                                  .catch((err) => {
                                    console.log(
                                      "Error updating patient count in else",
                                      err
                                    );
                                  });
                              })
                              .catch((err) => {
                                console.log(
                                  "Error getting collection id collection in else",
                                  err
                                );
                              });
                          })
                          .catch((err) => {
                            console.log(
                              "Error getting saving doc collection in else",
                              err
                            );
                          });
                      } else {
                        console.log("checkpoint 22");
                        Db.collection(
                          "Report_" + req.body.doctor_info.docId + "_bypat"
                        )
                          .add({
                            patient_id: req.body.patient_info.docId,
                            patient_lname: req.body.patient_info.lname,
                            patient_fname: req.body.patient_info.fname,
                            gender: req.body.patient_info.gender,
                            planName: req.body.package_name,
                            plan_price: req.body.package_Price,
                            testName: req.body.report.testName,
                            procedure: req.body.report.procedure,
                            created_date: req.body.report.created_date,
                            test_id: req.body.report.docId,
                            reportfiles: req.body.report.reportFile,
                            shareDate: new Date(),
                            sharedCount: req.body.sharedCount,
                            remainingCount: req.body.remainingCount,
                            calDrComission: this.calculatedDrComm,
                            calAdminComm: this.CalculatedAdminCom,
                            canShowNow: this.canShow,
                            status: "unpaid",
                            statusByDr : "in-progress"
                          })
                          .then((ref) => {
                            console.log("checkpoint 23");
                            Db.collection("PatientResults")
                              .doc(req.body.report.docId)
                              .update({
                                sharedWithDrsCount: req.body.sharedWithDrsCount,
                              })
                              .then((ref) => {
                                console.log("checkpoint 24");
                                // save log
                                let msgobj = {
                                  msg: "Patient shared result with Doctor",
                                  id: req.body.patient_info.docId,
                                  colec: "Patients",
                                };
                                saveLogFunc(msgobj);
                                // save log
                                res.json({
                                  status: "success",
                                  msg: "Result Share Successfully",
                                  docId: req.body.patient_info.docId,
                                });
                              })
                              .catch((err) => {
                                console.log(
                                  "Error Saving Patien Share Count 1",
                                  err
                                );
                              });
                          })
                          .catch((err) => {
                            console.log(
                              "Error getting collectionId collection",
                              err
                            );
                          });
                      }
                    })
                    .catch((err) => {
                      console.log("Error getting doct collection", err);
                    });
                });
            } else {
              console.log("checkpoint 16");
              Db.collection("Report_" + req.body.doctor_info.docId + "_bypat")
                .add({
                  patient_id: req.body.patient_info.docId,
                  patient_lname: req.body.patient_info.lname,
                  patient_fname: req.body.patient_info.fname,
                  gender: req.body.patient_info.gender,
                  planName: req.body.package_name,
                  plan_price: req.body.package_Price,
                  testName: req.body.report.testName,
                  procedure: req.body.report.procedure,
                  created_date: req.body.report.created_date,
                  test_id: req.body.report.docId,
                  reportfiles: req.body.report.reportFile,
                  shareDate: new Date(),
                  sharedCount: req.body.sharedCount,
                  remainingCount: req.body.remainingCount,
                  calDrComission: this.calculatedDrComm,
                  calAdminComm: this.CalculatedAdminCom,
                  canShowNow: this.canShow,
                  status: "unpaid",
                  statusByDr : "in-progress"
                })
                .then((ref) => {
                  console.log("checkpoint 17");
                  Db.collection("PatientResults")
                    .doc(req.body.report.docId)
                    .update({ sharedWithDrsCount: req.body.sharedWithDrsCount })
                    .then((ref) => {
                      console.log("checkpoint 18");
                      // save log
                      let msgobj = {
                        msg: "Patient shared result with Doctor",
                        id: req.body.patient_info.docId,
                        colec: "Patients",
                      };
                      saveLogFunc(msgobj);
                      // save log
                      res.json({
                        status: "success",
                        msg: "Result Share Successfully",
                        docId: req.body.patient_info.docId,
                      });
                    });
                });
            }
          })
          .catch((err) => {
            console.log(
              "Error getting documents 2.1st collection on base of collection id",
              err
            );
          });
      }
    });
  //res.json(req.body);
};

module.exports.getSharedPatients = function (req, res) {
  console.log(req.query);
  var Patients = [];
  Db.collection("Report_" + req.query.id)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Patients Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          Patients.push(tempArr);
        });
        res.json({
          status: "success",
          msg: "Patients Found!",
          patients_data: Patients,
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

function saveLogFunc(msgobj) {
  console.log(msgobj);
  let tempArr = [];
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date + " " + time;
  msgobj.date_time = dateTime;
  msgobj.date_time_obj = today;
  Db.collection(msgobj.colec)
    .doc(msgobj.id)
    .get()
    .then((doc) => {
      if (doc.exists) {
        tempArr = doc.data();
        if (msgobj.colec == "Hcf_members") {
          msgobj.msg += ": " + tempArr.memberEmail.toLowerCase() + " ";
        } else {
          msgobj.msg += ": " + tempArr.email.toLowerCase() + " ";
        }
        console.log(msgobj);
        Db.collection("history")
          .add(msgobj)
          .then((ref) => {
            console.log(ref);
          });
      } else {
        console.log(msgobj);
        Db.collection("history")
          .add(msgobj)
          .then((ref) => {
            console.log(ref);
          });
      }
    });
}

module.exports.saveLog = function (msgobj) {
  saveLogFunc(msgobj);
};

module.exports.getLogHistory = function (req, res) {
  console.log(req.query);
  let log = [];
  Db.collection("history")
    .where("id", "==", req.query.user_id)
    .orderBy("date_time_obj", "desc")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Log Found!" });
      } else {
        snapshot.forEach((doc) => {
          var tempArr = doc.data();
          tempArr.docId = doc.id;
          log.push(tempArr);
        });

        res.json({ status: "success", msg: "Log Found!", log_data: log });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.forgotUser = function (req, res) {
  console.log(req.query);
  let colec = "";
  if (req.body.type == "pat") {
    colec = "Patients";
  } else if (req.body.type == "doc") {
    colec = "Providers";
  } else if (req.body.type == "hcf") {
    colec = "Health_care_facility";
  } else if (req.body.type == "hcf_mem") {
    colec = "Hcf_members";
  } else {
    res.json({ status: "error", msg: "No Account Found!" });
  }
  Db.collection(colec)
    .where("email", "==", req.body.email.toLowerCase())
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        res.json({ status: "error", msg: "No Account Found!" });
      } else {
        snapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
          var params = {
            Destination: { /* required */
              // CcAddresses: [
              //   'EMAIL_ADDRESS',
              //   /* more items */
              // ],
              ToAddresses: [
                req.body.email.toLowerCase(),
                /* more items */
              ]
            },
            Message: { /* required */
              Body: { /* required */
                Html: {
                 Charset: "UTF-8",
                 Data: '<body><h1>Hello  <strong>' +
                 doc.data().fname +
                 '</strong>,</h1><h3>Please click on the Below link to reset your password: </h3><button style="padding: 10px;background: #173f5f;color: aliceblue;border: 1px solid #20639b;"><a style = "color: #eaeef5; padding: 15px; font-size: 20px;"href="http://3.6.197.52/#/auth/reset-password/' +
                 req.body.type +
                 "/" +
                 doc.id +
                 '">Reset Password</button></body>'
                },
                // Text: {
                //  Charset: "UTF-8",
                //  Data: "TEXT_FORMAT_BODY"
                // }
               },
               Subject: {
                Charset: 'UTF-8',
                Data: 'ShareEcare Reset Password'
               }
              },
            Source: 'shareecareapp@gmail.com', /* required */
            ReplyToAddresses: [
              'shareecareapp@gmail.com',
              /* more items */
            ],
          };
          
          // Create the promise and SES service object
          var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
          
          // Handle promise's fulfilled/rejected states
          sendPromise.then(
            function(data) {
              res.json({ status: "success", msg: "Please Check your Email" });
            }).catch(
              function(err) {
              res.json({ status: "error", msg: err });
            });
        });
      }
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};

module.exports.resetUserPass = function (req, res) {
  // req.body.canLogin = false;
  console.log(req.body);
  let colec = "";
  if (req.body.type == "pat") {
    colec = "Patients";
  } else if (req.body.type == "doc") {
    colec = "Doctors";
  } else if (req.body.type == "hcf") {
    colec = "Health_care_facility";
  } else if (req.body.type == "hcf_mem") {
    colec = "Hcf_members";
  } else {
    res.json({ status: "error", msg: "No Account Found!" });
  }
  let pssData = {
    password: req.body.password,
  };
  let addDoc = Db.collection(colec)
    .doc(req.body.docId)
    .update(pssData)
    .then((ref) => {
      console.log("ref", ref, "ref");
      // save log
      let msgobj = {
        msg: "Password reset by " + colec,
        id: req.body.docId,
        colec: colec,
      };
      saveLogFunc(msgobj);
      // save log
      res.json({ status: "success", msg: "Password Reset Successfully" });
    });
};

module.exports.totaldocsintable = function (req, res) {
  console.log(req.params.table);
  Db.collection(req.params.table)
    .get()
    .then((snapshot) => {
      res.json({ "total documents": snapshot.size });
    })
    .catch((err) => {
      console.log("Error getting documents", err);
    });
};


module.exports.sendMail = function (req, res){
  console.log(req.body);
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // const msg = {
  //   from: req.body.email.toLowerCase(),
  //   to: "support@share-ecare.com",
  //   subject: 'Sending Email From Contact Form',
  //   text: req.body.message,
  // };
  var html = '<h1>ShareEcare Contact Form Query</h1>';
  html += '<p><strong>Sender Name : </strong> '+req.body.name+'</p>';
  html += '<p><strong>Sender Email : </strong> '+req.body.email+'</p>';
  html += '<p><strong>Message : </strong> '+req.body.message+'</p>';
  var params = {
    Destination: { /* required */
      // CcAddresses: [
      //   'EMAIL_ADDRESS',
      //   /* more items */
      // ],
      ToAddresses: [
        'sikandaraliakram1@gmail.com',
        /* more items */
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: html
        },
        // Text: {
        //  Charset: "UTF-8",
        //  Data: "TEXT_FORMAT_BODY"
        // }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: req.body.subject
       }
      },
    Source: 'shareecareapp@gmail.com', /* required */
    ReplyToAddresses: [
      req.body.email.toLowerCase(),
      /* more items */
    ],
  };
  
  // Create the promise and SES service object
  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
  
  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function(data) {
      res.json({ status: "success", msg: "Email Sent Successfully" });
    }).catch(
      function(err) {
        console.log('not sent');
      console.error(err, err.stack);
      res.json({ status: "error", msg: err });
    });
  // sgMail.send(msg);
  // var nodemailer = require('nodemailer');

  // var transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'sikandaraliakram1@gmail.com',
  //     pass: 'Zain@123ali@@'
  //   }
  // });

  // var mailOptions = {
  //   from: req.body.email,
  //   to: 'sikandaraliakram1@gmail.com',
  //   subject: 'Sending Email From Contact Form',
  //   text: req.body.message
  // };

  // transporter.sendMail(mailOptions, function(error, info){
  //   if (error) {
  //     console.log(error);
  //     res.json({ status: "error", msg: "Mail Not Sent" });
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //     res.json({ status: "success", msg: info.response });
  //   }
  // });
}