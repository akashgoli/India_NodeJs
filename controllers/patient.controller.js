const stripe = require('stripe')('sk_test_vNKcRL25GgidaA3quiluzXKt006jXwQp03');// new account 
let common = require('./common.controller');
const AWS = require('aws-sdk');
const { Mongoose } = require('mongoose');
AWS.config.update({region: 'ap-south-1'});
module.exports.registerNewPat = function (req, res) {
    console.log(req.body);
    var filepath = '';
    if(req.files[0] != undefined){
        var path = req.files[0].path;
        filepath = path.substr(path.indexOf("/") + 1);
        //var pathArr = path.split('\\');
        //filepath = pathArr[1]+'/'+pathArr[2];
    }
    Db.collection('Patients').where('email', '==', req.body.email.toLowerCase()).get()
    .then(snapshot => {
        if (snapshot.empty) {
            let addDoc = Db.collection('Patients').add({
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                image : filepath,
                canLogin: false,
                showStep : 2,
                resultShareCount : 0
            }).then(ref => {
                console.log(ref);
                // save log
                let msgobj = {
                    msg : 'Patient registered',
                    id : ref.id,
                    colec : 'Patients'
                }
                common.saveLog(msgobj);
                // save log
                res.json({status : 'success', msg : 'Saved Successfully', docId : ref.id, userEmail : req.body.email.toLowerCase()});
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

module.exports.UpdateNewPat = function (req, res) {
    // req.body.canLogin = false;
    console.log(req.body);
    let addDoc = Db.collection('Patients').doc(req.body.docId).update(req.body).then(ref => {
        console.log('ref', ref, 'ref');
        // save log
        let msgobj = {
            msg : 'Prfile Updated by Patient',
            id : req.body.docId,
            colec : 'Patients'
        }
        common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Updated Successfully', docId : req.body.docId, userName : req.body.fname});
    });
}

module.exports.UpdateUserImage = function (req, res) {
    console.log(req.body, req.files);
    var filepath = '';
    if(req.files[0] != undefined){
        let path = req.files[0].path;
        console.log(path);
        filepath = path.substr(path.indexOf("/") + 1);
        //var pathArr = path.split('\\');
        //filepath = pathArr[1]+'/'+pathArr[2];
    }
    console.log('fpath'+filepath);

    Db.collection('Patients').doc(req.body.docId).update({image : filepath}).then(ref => {
        console.log(ref);
        // save log
        let msgobj = {
            msg : 'Picture Updated by Patient',
            id : req.body.docId,
            colec : 'Patients'
        }
        common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Updated Successfully', docId : req.body.docId, filepath : filepath});
    });
}

module.exports.loginPatient = function (req, res) {
    console.log(req.body); 
    var condition = 'email';
    if(req.body.key === 'phone'){
        condition = 'numberToLogin';
    }
    console.log(condition); 
    // return;
    mongoose.connect(mongodb+srv://deved:rhino11@cluster0.nzkyx.mongodb.net/1?retryWrites=true&w=majority)('Patients').where(condition, '==', req.body.loginWith.toLowerCase()).where('password', '==', req.body.password).get()
    .then(snapshot => {
        if (snapshot.empty) {
            res.json({status : 'error', msg : 'Incorrect Details Entered'});
        }else{
            snapshot.forEach(doc => {
                // console.log(doc.id, '=>', doc.data());
                var patData = doc.data();
                
                var patSub = patData.subscriptions;
                console.log('patient Sub Data', '=>', patSub);
                var current_ts = Math.round(new Date().getTime() / 1000);
                for (let i = 0; i < patSub.length; i++) {
                    var subscription = patSub[i];
                    console.log(subscription);
                    if(subscription.planName === 'Free' && subscription.status === 'active'){
                        if(subscription.expiryDate < current_ts){
                            console.log('expired');
                            subscription.status = 'cancel';
                        }
                    }
                    
                }
                console.log('Sub After', patSub);
                Db.collection('Patients').doc(doc.id).update({
                    subscriptions : patSub
                }).then(ref => {
                    Db.collection('Patients').doc(doc.id).get()
                    .then(doc => {
                        // save log
                        let msgobj = {
                            msg : 'Patient Logged in',
                            id : doc.id,
                            colec : 'Patients'
                        }
                        common.saveLog(msgobj);
                        // save log
                        res.json({status : 'success', msg : 'Login successfull.', docId : doc.id, docData : doc.data()});
                    })
                });
                
                // res.json({status : 'success', msg : 'Login successfull.', docId : doc.id, docData : doc.data()});
            });
            
        }
    })
}

module.exports.updatePatStateonSubscription = function(req, res){
    console.log(req.body); 
    Db.collection('Patients').doc(req.body.user_id).update({
        subscriptions : req.body.subscriptions
    }).then(ref => {
        Db.collection('Patients').doc(req.body.user_id).get()
        .then(doc => {
            // save log
            let msgobj = {
                msg : 'Patient Logged in',
                id : doc.id,
                colec : 'Patients'
            }
            common.saveLog(msgobj);
            // save log
            res.json({status : 'success', msg : 'Patient Subscription State Updated Successfully.', docId : doc.id, patientData : doc.data()});
        })
    });
}
module.exports.addPatResult = function (req, res) {
    console.log(req.body, req.files[0]);
    var filepath = '';
    var filesArr = [];
    if(req.files[0] != undefined){
        req.files.forEach(element => {
            temApp = {};
            temApp['name'] = element.originalname;
            temApp['path'] = element.path.substr(element.path.indexOf("/") + 1);
            filesArr.push(temApp);
        });
        //var pathArr = path.split('\\');
        //filepath = pathArr[1]+'/'+pathArr[2];
    }

    //console.log(filesArr);return false;
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
        // physician_name: req.body.physician_name,
        // pat_hcf: req.body.pat_hcf,
        // pat_hcf_name: req.body.pat_hcf_name,
        patient_id:req.body.patient_id,
        patient_name:req.body.patient_name,
        reportFile : filesArr,
        created_date : date,
        date_time_obj : today,
        sharedWithDrsCount : req.body.sharedWithDrsCount
    }).then(ref => {
        console.log(ref);
        // save log
        let msgobj = {
            msg : 'Result Added By Patient',
            id : req.body.patient_id,
            colec : 'Patients'
        }
        common.saveLog(msgobj);
        // save log
        res.json({status : 'success', msg : 'Saved Successfully', docId : req.body.patient_id});
    });
}

function updateSubscription(req_data, res){
    console.log('in update');
    stripe.subscriptions.update(req_data.stripe_plan_id, { cancel_at_period_end: false }, 
        function (err, updSub) {
            if (err) {
                console.log(err);
                var message = "Error Updating Subscription";
                res.json({status : 'error', msg : 'Error Updating Subscription'});
            } else {
                if(req_data.type == 'new'){
                    console.log('in update new');
                    stripe.paymentMethods.attach(
                        req_data.payment_method.id,
                        {customer: req_data.stripe_customer_id},
                        function(err, paymentMethod) {
                          // asynchronously called
                          if(paymentMethod){
                            stripe.customers.update(
                                req_data.stripe_customer_id,
                                {invoice_settings: {
                                    default_payment_method: req_data.payment_method.id,
                                }},
                                function(err, customer) {
                                    if(customer){
                                        let patient = Db.collection('Patients').doc(req_data.user_id).get()
                                        .then(doc => {
                                            if(doc.exists){
                                                var patientData = doc.data();
                                                var patientPayments = patientData.payments;
                                                for(let i =0; i < patientPayments.length; i++){
                                                    var patientPayment = patientPayments[i];
                                                    if(patientPayment.status == 1){
                                                        patientPayment.status = 0;
                                                    }
                                                }
                                                console.log('After status change ',patientPayments)
                                                console.log('Payments Before ', patientPayments);
                                                var findMethod = patientPayments.filter(x => x['paymentMethodId'] === req_data.payment_method.id)[0];
                                                console.log('Find', findMethod);
                                                if(findMethod == undefined){
                                                    method = {
                                                        paymentMethodId: req_data.payment_method.id,
                                                        type : req_data.payment_method.type,
                                                        brand : req_data.payment_method.card.brand,
                                                        exp_month: req_data.payment_method.card.exp_month,
                                                        exp_year: req_data.payment_method.card.exp_year,
                                                        last4: req_data.payment_method.card.last4,
                                                        status : 1
                                                    };
                                                    patientPayments.push(method);
                                                }
                                                console.log('Payments after ', patientPayments);
                                                
                                                var userSubscriptions           = req_data.user_subscriptions;
                                                var activeSubToCancel = userSubscriptions.filter(x => x['status'] === 'active')[0];
                                                if(activeSubToCancel != undefined){
                                                    stripe.subscriptions.update(activeSubToCancel.transactionId, { cancel_at_period_end: true },
                                                        function(err, cancelsub){
                                                            if(cancelsub){
                                                                stripe.subscriptions.update(req_data.stripe_plan_id, { cancel_at_period_end: false },
                                                                    function(err, updateSub){
                                                                        if(updateSub){
                                                                            for (var i = 0; i < userSubscriptions.length; i++) {
                                                                                var subscription = userSubscriptions[i];
                                                                                if(subscription.transactionId == req_data.stripe_plan_id && subscription.status == 'cancel'){
                                                                                    subscription.status = 'active';
                                                                                }else{
                                                                                    subscription.status = 'cancel';
                                                                                }
                                                                            }
                                                                            Db.collection('Patients').doc(req_data.user_id).update({
                                                                                subscriptions : userSubscriptions,
                                                                                payments : patientPayments
                                                                            }).then(ref => {
                                                                                sendingEmails(req_data, updateSub)
                                                                                res.json({status : 'success', msg : 'Successfully Updated Subscription'});
                                                                            });
                                                                        }
                                                                    }
                                                                )
                                                            }
                                                        }
                                                    )
                                                }else{
                                                    stripe.subscriptions.update(req_data.stripe_plan_id, { cancel_at_period_end: false },
                                                        function(err, updateSub){
                                                            if(updateSub){
                                                                for (var i = 0; i < userSubscriptions.length; i++) {
                                                                    var subscription = userSubscriptions[i];
                                                                    if(subscription.transactionId == req_data.stripe_plan_id && subscription.status == 'cancel'){
                                                                        subscription.status = 'active';
                                                                    }else{
                                                                        subscription.status = 'cancel';
                                                                    }
                                                                }
                                                                Db.collection('Patients').doc(req_data.user_id).update({
                                                                    subscriptions : userSubscriptions,
                                                                    payments : patientPayments
                                                                }).then(ref => {
                                                                    sendingEmails(req_data, updateSub)
                                                                    res.json({status : 'success', msg : 'Successfully Updated Subscription'});
                                                                });
                                                            }
                                                        }
                                                    )
                                                }
                                            }
                                        })
                                    }else{
                                        // res.json({status : 'error', msg : 'Error In Updating Customer Payment Method'});  
                                        // return {
                                        //     status : 'error', msg : 'Error In Updating Customer Payment Method'
                                        // };
                                        res.json({status : 'error', msg : 'Error In Updating Customer Payment Method'});
                                    }
                                }
                              );
                            console.log('in payment attach done', paymentMethod);
                            
                          }else{
                            res.json({status : 'error', msg : 'Something Went Wrong'});  
                            //return 'error';
                          }
                        }
                    ); 
                }else{
                    var userSubscriptions           = req_data.user_subscriptions;
                    var activeSubToCancel           = userSubscriptions.filter(x => x['status'] === 'active')[0];
                    if(activeSubToCancel != undefined){
                        stripe.subscriptions.update(activeSubToCancel.transactionId, { cancel_at_period_end: true },
                            function(err, cancelsub){
                                if(cancelsub){
                                    stripe.subscriptions.update(req_data.stripe_plan_id, { cancel_at_period_end: false },
                                        function(err, updateSub){
                                            if(updateSub){
                                                for (var i = 0; i < userSubscriptions.length; i++) {
                                                    var subscription = userSubscriptions[i];
                                                    if(subscription.transactionId == req_data.stripe_plan_id && subscription.status == 'cancel'){
                                                        subscription.status = 'active';
                                                    }else{
                                                        subscription.status = 'cancel';
                                                    }
                                                }
                                                Db.collection('Patients').doc(req_data.user_id).update({
                                                    subscriptions : userSubscriptions
                                                }).then(ref => {
                                                    sendingEmails(req_data, updateSub)
                                                    res.json({status : 'success', msg : 'Successfully Updated Subscription'});
                                                });
                                            }
                                        }
                                    )
                                }
                            }
                        )
                    }else{
                        stripe.subscriptions.update(req_data.stripe_plan_id, { cancel_at_period_end: false },
                            function(err, updateSub){
                                if(updateSub){
                                    for (var i = 0; i < userSubscriptions.length; i++) {
                                        var subscription = userSubscriptions[i];
                                        if(subscription.transactionId == req_data.stripe_plan_id && subscription.status == 'cancel'){
                                            subscription.status = 'active';
                                        }else{
                                            subscription.status = 'cancel';
                                        }
                                    }
                                    Db.collection('Patients').doc(req_data.user_id).update({
                                        subscriptions : userSubscriptions
                                    }).then(ref => {
                                        sendingEmails(req_data, updateSub)
                                        res.json({status : 'success', msg : 'Successfully Updated Subscription'});
                                    });
                                }
                            }
                        )
                    }
                }
            }
        }
    )
}

function createSubscription(customer_id,data, res){
    console.log('Data in Create Function ',data);
    var cancelTime = false;
    var status = 'active';
    patSub = [];
    
    var paymentMethodId = '';
    if(data.type == 'new'){
        paymentMethodId   = data.payment_method.id;
    }else{
        paymentMethodId   = data.payment_method;
    }
    if(data.planrecurring == 'no'){
        cancelTime = true
        status = 'cancel';
    }
    let patient = Db.collection('Patients').doc(data.user_id).get()
    .then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
        } else {
            var patientData = doc.data();
            console.log('Document data:', doc.data());
            stripe.subscriptions.create({
                customer: customer_id,
                items: [{plan: data.stripe_plan_id}],
                cancel_at_period_end: cancelTime
            })
            .then((sub) => {
                console.log('sub Done in stripe', sub);
                console.log("Patient Data after sub",patientData);
                // return false;
                var patientPayments = patientData.payments;
                console.log('Before ',patientPayments);
                if(patientPayments == undefined){
                    patientPayments = [];
                    paymentMethod = {
                        paymentMethodId: paymentMethodId,
                        type : data.payment_method.type,
                        brand : data.payment_method.card.brand,
                        exp_month: data.payment_method.card.exp_month,
                        exp_year: data.payment_method.card.exp_year,
                        last4: data.payment_method.card.last4,
                        status : 1
                      };
                      patientPayments.push(paymentMethod);
                }else{
                    for(let i =0; i < patientPayments.length; i++){
                        var patientPayment = patientPayments[i];
                        if(patientPayment.status == 1){
                            patientPayment.status = 0;
                        }
                    }
                    console.log('After status change ',patientPayments)
                    var findMethod = patientPayments.filter(x => x['paymentMethodId'] === paymentMethodId)[0];
                    console.log(findMethod);
                    if(findMethod == undefined){
                        paymentMethod = {
                            paymentMethodId: paymentMethodId,
                            type : data.payment_method.type,
                            brand : data.payment_method.card.brand,
                            exp_month: data.payment_method.card.exp_month,
                            exp_year: data.payment_method.card.exp_year,
                            last4: data.payment_method.card.last4,
                            status : 1
                          };
                          patientPayments.push(paymentMethod);
                    }
                }
                console.log('After ',patientPayments)
                
                var patSub = patientData.subscriptions;
                console.log('patSub ',patSub)
                if(patSub == undefined){
                    patSub = [];
                    subscription = {
                        transactionId: sub.id,
                        plan_id : data.stripe_plan_id,
                        status: status,
                        paymentTime: sub.current_period_start,
                        expiryDate: sub.current_period_end,
                        planName : data.planName,
                        planFee : data.planPrice,

                    };
                    patSub.push(subscription);
                    console.log('After Paysub in active found',patSub);
                    Db.collection('Patients').doc(data.user_id).update({
                        canLogin : true,
                        stripe_customer_id : customer_id, 
                        subscriptions : patSub,
                        payments : patientPayments
                    }).then(ref => {
                        sendingEmails(data, sub, res)
                        res.json({status : 'success', msg : 'Saved Successfully'});
                    });
                }else{
                    var activeSubToCancel = patSub.filter(x => x['status'] === 'active')[0];
                    if(activeSubToCancel != undefined){
                        console.log('Active Sub Found');
                        stripe.subscriptions.update(activeSubToCancel.transactionId, { cancel_at_period_end: true },
                            function(err, subCancel){
                                if(subCancel){
                                    console.log('In Cancel Sub');
                                    for (var i = 0; i < patSub.length; i++) {
                                        var subscription = patSub[i];
                                        if(subscription.status == 'active'){
                                            subscription.status = 'cancel';
                                        }
                                    }
                                    console.log('Subscriptin after cancel at stripe', patSub);
                                    subscription = {
                                        transactionId: sub.id,
                                        plan_id : data.stripe_plan_id,
                                        status: status,
                                        paymentTime: sub.current_period_start,
                                        expiryDate: sub.current_period_end,
                                        planName : data.planName,
                                        planFee : data.planPrice,
                                    };
                                    patSub.push(subscription);
                                    console.log('After Paysub in active found',patSub);
                                    Db.collection('Patients').doc(data.user_id).update({
                                        canLogin : true,
                                        stripe_customer_id : customer_id, 
                                        subscriptions : patSub,
                                        payments : patientPayments
                                    }).then(ref => {
                                        sendingEmails(data, sub, res)
                                        res.json({status : 'success', msg : 'Update Successfully'});
                                    });
                                    // patSub.push(activeSubToCancel);
                                }
                            }
                        )
                    }else{
                        subscription = {
                            transactionId: sub.id,
                            plan_id : data.stripe_plan_id,
                            status: status,
                            paymentTime: sub.current_period_start,
                            expiryDate: sub.current_period_end,
                            planName : data.planName,
                            planFee : data.planPrice,
                        };
                        patSub.push(subscription);
                        console.log('After Paysub in no active',patSub);
                        Db.collection('Patients').doc(data.user_id).update({
                            canLogin : true,
                            stripe_customer_id : customer_id, 
                            subscriptions : patSub,
                            payments : patientPayments
                        }).then(ref => {
                            sendingEmails(data, sub, res)
                            res.json({status : 'success', msg : 'Updated Successfully'});
                        });
                    }
                      
                }
                
            })
        }
    })
    .catch(err => {
        console.log('Error getting document', err);
        res.json({status : 'error', msg : err});
    });
    
}

module.exports.patientPayment = async function(req, res) {
    console.log('Requet body ------- ',req.body);
    var paymentMethodId = '';
    if(req.body.type == 'new'){
        paymentMethodId   = req.body.payment_method.id;
    }else{
        paymentMethodId   = req.body.payment_method;
    }

    if(req.body.action == 'update'){
       const resp = updateSubscription(req.body, res);
       console.log(resp)
        // res.json({status : 'success', msg : 'Update Done', result : resp});
    }else{
        if(!req.body.stripe_customer_id){
            stripe.customers.create({
                email: req.body.email.toLowerCase(),
                payment_method: paymentMethodId,
                description: 'New Patient',
                invoice_settings: {
                  default_payment_method: paymentMethodId,
                },
            })
            .then((customer) => {
                console.log('Customer on Stripe',customer);
                createSubscription(customer.id,req.body, res);
                // res.json({status : 'success', msg : 'Saved Successfully'});
            })
        }else{
            stripe.paymentMethods.attach(
                paymentMethodId,
                {customer: req.body.stripe_customer_id},
                function(err, paymentMethod) {
                  // asynchronously called
                  if(paymentMethod){
                    // createSubscription(req.body.stripe_customer_id,req.body, res);
                    stripe.customers.update(
                        req.body.stripe_customer_id,
                        {invoice_settings: {
                            default_payment_method: paymentMethodId,
                        }},
                        function(err, customer) {
                            if(customer){
                                createSubscription(req.body.stripe_customer_id,req.body, res);
                                // res.json({status : 'success', msg : 'Payment Done'});
                            }else{
                                res.json({status : 'error', msg : 'Error In Updating Customer Payment Method'});  
                            }
                        }
                      );
                  }else{
                    res.json({status : 'error', msg : 'Something Went Wrong'});  
                  }
                }
            );
        }
    }   
}

module.exports.cancelSubscription = function(req, res){
    console.log(req.body);
    stripe.subscriptions.update(req.body.active_subscription_id, { cancel_at_period_end: true },
        function (err, updSub) {
            if (err) {
                console.log(err);
                var message = "Error Cancelling Subscription";
                return message; 
            } else {
                var userSubscriptions           = req.body.user_subscriptions;
                console.log("Before For Loop", userSubscriptions);
                for (var i = 0; i < userSubscriptions.length; i++) {
                    var subscription = userSubscriptions[i];
                    console.log('Before ',subscription); 
                    if(subscription.transactionId == req.body.active_subscription_id && subscription.status == 'active'){
                        subscription.status = 'cancel';
                    }
                    console.log('After ',subscription);

                }
                console.log("after For Loop", userSubscriptions);
                Db.collection('Patients').doc(req.body.docId).update({
                    subscriptions : userSubscriptions
                }).then(ref => {
                    res.json({status : 'success', msg : 'Cancel Done'});
                });
            }
        }
    )
}

module.exports.deletePaymentMethod = function(req, res){
    console.log(req.body);
    var userId = req.body.user_id;
    var paymentId = req.body.payment_method_id;
    
    stripe.paymentMethods.detach(
        paymentId,
        function(err, paymentMethod) {
          // asynchronously called
          if(err){
            console.log(err);
            res.json({status : 'error', msg : 'Error Deleting Payment Method'});
          }else{
            console.log('Detach Done',paymentMethod);
            var userPaymentMethods           = req.body.userPaymentMethods;
            for (var i = 0; i < userPaymentMethods.length; i++){
              var p = userPaymentMethods[i];
              if(p.paymentMethodId == paymentId){
                userPaymentMethods.splice(i, 1);
              }
            }
            Db.collection('Patients').doc(userId).update({
                payments : userPaymentMethods
            }).then(ref => {
                res.json({status : 'success', msg : 'Cancel Done'});
            });
          }
          
        }
    );
}

module.exports.makePrimaryPaymentMethod = function(req, res){
    console.log(req.body);
    var userPaymentMethods = req.body.userPaymentMethods;
    stripe.customers.update(
        req.body.stripe_customer_id,
        {invoice_settings: {
            default_payment_method: req.body.payment_method_id,
        }},
        function(err, customer) {
            if(customer){
                console.log('before Done',userPaymentMethods);
                for(let i =0; i < userPaymentMethods.length; i++){
                    var patientPayment = userPaymentMethods[i];
                    if(patientPayment.paymentMethodId == req.body.payment_method_id){
                        patientPayment.status = 1;
                    }else{
                        patientPayment.status = 0; 
                    }
                }
                console.log('After Done',userPaymentMethods);
                Db.collection('Patients').doc(req.body.user_id).update({
                    payments : userPaymentMethods
                }).then(ref => {
                    res.json({status : 'success', msg : 'Payment Method Primary Done'});
                });
            }else{
                res.json({status : 'error', msg : 'Error In Updating Customer Payment Method'});  
            }
        }
      );
}

module.exports.paymentForDrPlan = function (req, res){
    console.log(req.body);
    var paymentMethodId = '';
    var amount = req.body.amount * 100;
    if(req.body.type == 'old'){
        paymentMethodId = req.body.payment_method;
    }else{
        paymentMethodId = req.body.payment_method.id;
    }


    if(req.body.type == 'new'){
        console.log('in new');
        stripe.paymentMethods.attach(
            paymentMethodId,
            {customer: req.body.stripe_customer_id},
            function(err, paymentMethod) {
              // asynchronously called
              if(paymentMethod){
                stripe.customers.update(
                    req.body.stripe_customer_id,
                    {invoice_settings: {
                        default_payment_method: paymentMethodId,
                    }},
                    function(err, customer) {
                        if(customer){
                            stripe.paymentIntents.create({
                                amount: amount,
                                currency: 'INR',
                                payment_method_types: ['card'],
                                payment_method:paymentMethodId,
                                description: 'Payment Dr Plan By Patient',
                                customer : req.body.stripe_customer_id,
                                confirm : true,
                              })
                              .then((payment) => {
                                    console.log('payment Done', payment); 
                                    var paymentMethodsArray = req.body.user_payment_methods;
                                    for(let i =0; i < paymentMethodsArray.length; i++){
                                        var patientPayment = paymentMethodsArray[i];
                                        if(patientPayment.status == 1){
                                            patientPayment.status = 0;
                                        }
                                    }
                                    var findMethod = paymentMethodsArray.filter(x => x['paymentMethodId'] === paymentMethodId)[0];
                                    //console.log(findMethod);
                                    if(findMethod == undefined){
                                        paymentMethod = {
                                        paymentMethodId: paymentMethodId,
                                        type : req.body.payment_method.type,
                                        brand : req.body.payment_method.card.brand,
                                        exp_month: req.body.payment_method.card.exp_month,
                                        exp_year: req.body.payment_method.card.exp_year,
                                        last4: req.body.payment_method.card.last4,
                                        status : 1
                                        };
                                        paymentMethodsArray.push(paymentMethod);
                                    }
                                    Db.collection('Patients').doc(req.body.user_id).update({
                                        payments : paymentMethodsArray
                                    }).then(ref => {
                                        res.json({status : 'success', msg : 'Done'});
                                    })
                                    .catch((err)=>{
                                        console.log(err);
                                        res.json({status : 'error', msg : 'Error Adding Payment Method in DB'});
                                    })
                                  
                              })
                              .catch((paymentError)=>{
                                res.json({status : 'error', msg : paymentError});
                              })
                        }else{
                            res.json({status : 'error', msg : 'Error In Updating Customer Payment Method'});  
                        }
                    }
                  );
              }else{
                res.json({status : 'error', msg : 'Something Went Wrong'});  
              }
            }
        );
    }else{
        console.log('in old');
        
        stripe.paymentIntents.create({
            amount: amount,
            currency: 'INR',
            payment_method_types: ['card'],
            payment_method:paymentMethodId,
            description: 'Payment Dr Plan By Patient',
            customer : req.body.stripe_customer_id,
            confirm : true,
          })
          .then((payment) => {
              console.log('in ',payment);
                if(payment){
                    res.json({status : 'success', msg : 'Payment Done'});
                }else{
                    res.json({status : 'error', msg : 'Something went wrong'});  
                }
          })
          .catch((paymentError)=>{
              console.log(paymentError);
            res.json({status : 'error', msg : paymentError});
          })
    }

    
}

module.exports.getRecurringDetails = function(req, res){
    var data = req.body.data.object;
    var patientData = [];
    Db.collection('Patients').where('email', '==', data.customer_email.toLowerCase()).get()
    .then(snapshot => {
        if (snapshot.empty) {
            console.log('No such document!');
            // res.json({status : 'error', msg : 'No Patient Found!'});
        }else{
            snapshot.forEach(doc => {
                var tempArr = doc.data();
                tempArr.docId = doc.id;
                patientData.push(tempArr);
            });
            console.log('Patient ', patientData);
            patientData = patientData[0];
            var patSub = patientData.subscriptions;
            console.log(patSub);
            if(req.body.type == 'invoice.payment_succeeded'){
                for(var i =0; i < patSub.length; i++){
                    var patSubscription = patSub[i];
                    if(patSubscription.transactionId == data.subscription){
                        patSubscription.paymentTime = data.lines.data[0].period.start;
                        patSubscription.expiryDate = data.lines.data[0].period.end;
                        patSubscription.status = 'active';
                    }
                }
                Db.collection('Patients').doc(patientData.docId).update({
                    subscriptions : patSub
                }).then(ref => {
                    let msgobj = {
                        msg : 'Patient Subscription Renew',
                        id : patientData.docId,
                        colec : 'Patients'
                    }
                    common.saveLog(msgobj);
                    // res.sendStatus(200);
                }); 
            }else{
                stripe.subscriptions.del(
                    data.subscription,
                    function(err, confirmation) {
                      // asynchronously called
                      if(confirmation){
                        for(var i =0; i < patSub.length; i++){
                            var patSubscription = patSub[i];
                            if(patSubscription.transactionId == data.subscription){
                                // patSubscription.paymentTime = data.lines.data[0].period.start;
                                // patSubscription.expiryDate = data.lines.data[0].period.end;
                                patSubscription.status = 'cancel';
                            }
                        }
                        Db.collection('Patients').doc(patientData.docId).update({
                            subscriptions : patSub
                        }).then(ref => {
                            let msgobj = {
                                msg : 'Patient Subscription Renew Failed',
                                id : patientData.docId,
                                colec : 'Patients'
                            }
                            common.saveLog(msgobj);
                            
                        });
                      }
                    }
                ); 
            }
        } 
    })
    res.sendStatus(200); 
}

function sendingEmails(data, sub, res){
    var html = '<h1>Hello '+data.name+'</h1>';
    // html += '<p>Your subscription plan with Share-e-care has been successfully updated. Please see below for details</p>';
    html += '<p>Thank you For Choosing share-e-care!</p>';
    html += '<p>Subscription details</p>';
    html += '<p><strong>Plan Name :</strong> '+data.planName+'</p>';
    html += '<p><strong>Plan Fees :</strong> '+data.planPrice+'</p>';
    html += '<p><strong>Plan Description :</strong> '+data.planDescription+'</p>';
    html += '<p><strong>Account Phone Number :</strong> '+data.phone+'</p>';
    html += '<p><strong>Date Updated :</strong> '+new Date()+'</p>';
    html += '<p><strong>Expiration Date :</strong> '+ new Date(0).setUTCSeconds(sub.current_period_end) +'</p>';

    var params = {
        Destination: { /* required */
            ToAddresses: [
            data.email.toLowerCase()
            ]
        },
        Message: { /* required */
            Body: { /* required */
            Html: {
                Charset: "UTF-8",
                Data: html
            }
            },
            Subject: {
            Charset: 'UTF-8',
            Data: 'Thank you for updating your subscription plan'
            }
            },
        Source: 'shareecareapp@gmail.com', /* required */
        ReplyToAddresses: [
            'shareecareapp@gmail.com'
        ],
    };
    
    // Create the promise and SES service object
    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
    
    // Handle promise's fulfilled/rejected states
    sendPromise.then(
        function(data) {
            res.json({ status: "success", msg: "Subscription Details Have been Sent To Your Email" });
        }
    ).catch(
        function(err) {
            res.json({ status: "error", msg: err });
        }
    );
}