const authenticationModel = require("../models/authentication");
// const { hashSync, genSaltSync, compareSync } = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { sign } = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
const dbConn = require('../../config/db.config')
const AWS = require('aws-sdk');
const { log } = require("async");
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
require('dotenv').config()


AWS.config.update({ region: 'ap-south-1' })

const credentials = new AWS.Credentials({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
})

AWS.config.credentials = credentials

function createEmployeeService(req, res) {
  const body = req.body;
  authenticationModel.createEmployeeModel(req, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      res.json({
        status: true,
        message: "Employee Registered Successfully.",
        data: user,
      });
    }
  });
};



function getEmployeeDataService(req, res) {
  const body = req.body;
  authenticationModel.getEmployeeDataModel(body, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      res.json({
        status: true,
        message: "Data get Successfully",
        data: user,
      });
    }
  });
};



const CompareFunctionService = (req, res) => {
  authenticationModel.CompareFaces(req, (err, result) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.send(result)
    }
  })
}



const uploadImage = (req, res) => {
  authenticationModel.UploadImage(req, (err, result) => {

    if (err) {
      res.send(err)
    } else {
      res.send(result)
    }
  })
}

const UploadJoiningForms = (req, res) => {
  authenticationModel.UploadJoiningForms(req, (err, result) => {

    if (err) {
      res.send(err)
    } else {
      res.send(result)
    }
  })
}



const SendSMS = (req, res) => {
  authenticationModel.sendSms(req, (err, result) => {
    if (err) {
      res.send(err)
    } else {
      res.send(result)
    }
  })
}


const getDepartment = (req, res) => {
  authenticationModel.getDepartmentList(req, (err, result) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.send({
        status: true,
        message: 'Date got Succesfully !',
        data: result[0]
      })
    }
  })
}


const getDesignation = (req, res) => {
  authenticationModel.getDesignationList(req, (err, result) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.send({
        status: true,
        message: 'Data got Successfully !',
        data: result[0]
      })
    }
  })
}

const getReportingManagers = (req, res) => {
  authenticationModel.getReportingManagerList(req, (err, result) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.send({
        status: true,
        message: 'Data got Successfully !',
        data: result[0]
      })
    }
  })
}


const Login = (req, res) => {
  authenticationModel.login(req, (err, result) => {
    if (err) {
      res.status(400).send({
        status:false,
        data:'Employee Does not exists'
      })
    } else {
      if (result == 'Employee Does not exists') {

        res.status(400).send({
          status:false,
          data:'Employee Does not exists'
        })

      } else if (result == 'something went wrong during comparing password') {

        res.status(400).send({
          status:false,
          data:'something went wrong during comparing password'
        })

      } else if (result == 'Wrong Password Entered') {

        res.status(400).send({
          status:false,
          data:'Wrong Password Entered'
        })

      }else{

        res.status(200).send({
          status:true,
          data:result
        })

      }
    }
  })
}


const ExternalAttendanceService = (req,res)=>{
  
  authenticationModel.ExternalAttendance(req,function(err,result){
    if(err){
     res.status(400).send(err)
    }else{
res.send(result)
    }
  })
}
const AuthService = {
  createEmployeeService: createEmployeeService,
  getEmployeeDataService: getEmployeeDataService,
  uploadImage,
  UploadJoiningForms,
  CompareFunctionService,
  SendSMS,
  getDepartment,
  getDesignation,
  getReportingManagers,
ExternalAttendanceService,
  Login
}

module.exports = AuthService;