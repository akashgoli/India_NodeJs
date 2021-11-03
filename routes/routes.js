const express = require('express');
const app = express();
const Routes = express.Router();
var multer  = require('multer');

// var multipart = require('connect-multiparty');

// var docMultiPart = multipart({
//     uploadDir: './uploads/doctor'
// });
// var patMultiPart = multipart({
//     uploadDir: './uploads/patient'
// });
// var patreportsMultiPart = multipart({
//     uploadDir: './uploads/patient/reports'
// });
// var hcfMultiPart = multipart({
//     uploadDir: './uploads/hcf'
// });

// var adminMultiPart = multipart({
//     uploadDir: './uploads/admin'
// });

const patMultiPart = multer.diskStorage({
    destination: 'uploads/patient/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/ /g,''));
    }
  });
const patMultiPartUpload = multer({ storage: patMultiPart }).array('file');

const patreportsMultiPart = multer.diskStorage({
    destination: 'uploads/patient/reports/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/ /g,''));
    }
  });
const patreportsMultiPartUpload = multer({ storage: patreportsMultiPart }).array('file[]');

const docMultiPart = multer.diskStorage({
    destination: 'uploads/doctor/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/ /g,''));
    }
  });
const docMultiPartUpload = multer({ storage: docMultiPart }).array('file');

const hcfMultiPart = multer.diskStorage({
    destination: 'uploads/hcf/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/ /g,''));
    }
  });
const hcfMultiPartUpload = multer({ storage: hcfMultiPart }).array('file');

const adminMultiPart = multer.diskStorage({
    destination: 'uploads/admin/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname.replace(/ /g,''));
    }
  });
const adminMultiPartUpload = multer({ storage: adminMultiPart }).array('file');


// Require Business model in our routes module
//let Business = require('../models/Business');
let common = require('../controllers/common.controller');
let pat = require('../controllers/patient.controller');
let doc = require('../controllers/doctor.controller');
let hcf = require('../controllers/facility.controller');
let admin = require('../controllers/admin.controller');

// Defined store route
Routes.route('/').get(function (req, res) {
    console.log('main route');
});

// Defined common routes
Routes.route('/get_states').get(common.get_states);
Routes.route('/getProcList').get(common.getProcList);
Routes.route('/getSubProcList').get(common.getSubProcList);
Routes.route('/get_cities').get(common.get_cities);
Routes.route('/get_areas').get(common.get_areas);
Routes.route('/get_specialties').get(common.get_specialties);
Routes.route('/getsubscriptioplans').get(common.getsubscriptioplans);
Routes.route('/getsubscriptioplansByRole').get(common.getsubscriptioplansByRole);
Routes.route('/getPatientByEmail').get(common.getPatientByEmail);
Routes.route('/getDoctorByEmail').get(common.getDoctorByEmail);
Routes.route('/getHcfByEmail').get(common.getHcfByEmail);
Routes.route('/getPatientResults').get(common.getPatientResults);
Routes.route('/getResultsbyDoctor').get(common.getResultsbyDoctor);
Routes.route('/getDoctorList').get(common.getDoctorList);
Routes.route('/getDoctorListByFilter').post(common.getDoctorListByFilter);
Routes.route('/findProvider').post(common.findProvider);
Routes.route('/findFacility').post(common.findFacility);
Routes.route('/getPatientList').get(common.getPatientList);
Routes.route('/getHcfList').get(common.getHcfList);
Routes.route('/getHcfListOfPat').get(common.getHcfListOfPat);
Routes.route('/getAllHcfList').get(common.getAllHcfList);
Routes.route('/getuserData').get(common.getuserData);
Routes.route('/saveNewMsg').post(common.saveNewMsg);
Routes.route('/downloadFile').post(common.downloadFile);
Routes.route('/addNewPat').post(common.addNewPat);
Routes.route('/getmypatients').get(common.getmypatients);
Routes.route('/getSharedPatients').get(common.getSharedPatients);
Routes.route('/share_with_doctor').post(common.share_with_doctor);
Routes.route('/checkcollection').get(common.checkcollection);
Routes.route('/getLogHistory').get(common.getLogHistory);
Routes.route('/forgotUser').post(common.forgotUser);
Routes.route('/resetUserPass').post(common.resetUserPass);
Routes.route('/totaldocsintable/:table').get(common.totaldocsintable);
Routes.route('/sendMail').post(common.sendMail);

// Defined patient routes
Routes.route('/registerNewPat').post(patMultiPartUpload, pat.registerNewPat);
Routes.route('/UpdateNewPat').post(pat.UpdateNewPat);
Routes.route('/updatePatStateonSubscription').post(pat.updatePatStateonSubscription);
Routes.route('/loginPatient').post(pat.loginPatient);
Routes.route('/addPatResult').post(patreportsMultiPartUpload, pat.addPatResult);
Routes.route('/UpdateUserImage').post(patMultiPartUpload, pat.UpdateUserImage);
Routes.route('/patientPayment').post(pat.patientPayment);
Routes.route('/paymentForDrPlan').post(pat.paymentForDrPlan);
Routes.route('/cancelSubscription').post(pat.cancelSubscription);
Routes.route('/deletePaymentMethod').post(pat.deletePaymentMethod);
Routes.route('/makePrimaryPaymentMethod').post(pat.makePrimaryPaymentMethod);
Routes.route('/getRecurringDetails').post(pat.getRecurringDetails);

// Defined doctor routes
Routes.route('/registerNewDoc').post(docMultiPartUpload, doc.registerNewDoc);
Routes.route('/UpdateDocImage').post(docMultiPartUpload, doc.UpdateDocImage);
Routes.route('/UpdateNewDoc').post(doc.UpdateNewDoc);
Routes.route('/loginDoctor').post(doc.loginDoctor);
Routes.route('/addSubscriptionPlan').post(doc.addSubscriptionPlan);
Routes.route('/addNoteByDr').post(doc.addNoteByDr);
Routes.route('/changeReportStatus').post(doc.changeReportStatus);
Routes.route('/delSubscriptionPlan').post(doc.delSubscriptionPlan);
Routes.route('/getComissionData').get(doc.getComissionData);

// Defined facility routes
Routes.route('/registerNewHcf').post(hcfMultiPartUpload, hcf.registerNewHcf);
Routes.route('/UpdateHcfImage').post(hcfMultiPartUpload, hcf.UpdateHcfImage);
Routes.route('/UpdateNewHcf').post(hcf.UpdateNewHcf);
Routes.route('/loginHcf').post(hcf.loginHcf);
Routes.route('/addMember').post(hcf.addMember);
Routes.route('/updateMember').post(hcf.updateMember);
Routes.route('/getMembers').get(hcf.getMembers);
Routes.route('/changeMemberStatus').post(hcf.changeMemberStatus);
Routes.route('/addPatResultbyHCF').post(patreportsMultiPartUpload, hcf.addPatResultbyHCF);
Routes.route('/loginHcfMember').post(hcf.loginHcfMember);

//Defined Super Admin Routes
Routes.route('/addAdminPlans').post(admin.addAdminPlans);
Routes.route('/getAdminPlans').get(admin.getAdminPlans);
Routes.route('/delAdminPlan').post(admin.delAdminPlan);
Routes.route('/getCountForAdmin').get(admin.getCountForAdmin);
Routes.route('/getAdminSettings').get(admin.getAdminSettings);
Routes.route('/saveAdminSettings').post(admin.saveAdminSettings);
Routes.route('/changePaymentStatus').post(admin.changePaymentStatus);
Routes.route('/getDoctorlistByPatId').get(admin.getDoctorlistByPatId);
Routes.route('/uploadDataFile').post(adminMultiPartUpload, admin.uploadDataFile);
Routes.route('/getPatientByType').get(admin.getPatientByType);
Routes.route('/getUnverifiedDoctors').get(admin.getUnverifiedDoctors);
Routes.route('/verifyDoctor').get(admin.verifyDoctor);
Routes.route('/blockDoctor').get(admin.blockDoctor);
module.exports = Routes;