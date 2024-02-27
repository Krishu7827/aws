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


AWS.config.update({region: 'ap-south-1'})

const credentials = new AWS.Credentials({
 accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
})

AWS.config.credentials = credentials

function createEmployeeService(req, res) {
  const body = req.body;
  authenticationModel.createEmployeeModel(body, (err, user) => {
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



const CompareFunctionService = (req,res)=>{
  authenticationModel.CompareFaces(req,(err,result)=>{
    if(err){
      res.status(500).send(err)
    }else{
      res.send(result)
    }
  })
}



const uploadImage = (req,res)=>{
    authenticationModel.UploadImage(req,(err,result)=>{

      if(err){
        res.send(err)
      }else{
        res.send(result)
      }
    })
}

const UploadJoiningForms = (req,res)=>{
  authenticationModel.UploadJoiningForms(req,(err,result)=>{

    if(err){
      res.send(err)
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
 CompareFunctionService
}

module.exports = AuthService;