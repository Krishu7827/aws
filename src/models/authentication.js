var dbConn = require("../../config/db.config");
var crypto = require("crypto");
var async = require("async");
const bcrypt = require("bcrypt");
const AWS = require('aws-sdk');
const { resolve } = require("path");
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
require('dotenv').config()


AWS.config.update({region: 'ap-south-1'})

const credentials = new AWS.Credentials({
 accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
})

AWS.config.credentials = credentials

function createEmployeeModel(userReqData, callBack) {
  var query =
  "call spAddEditemployee('" + JSON.stringify(userReqData) + "')";
  dbConn.query(query, (err, results, fields) => {
    if (err) {
     console.log(err);
      console.log("Error while creating news");
      callBack(err);
    } else {
      console.log("Employee registered successfully.");
      return callBack(null, results);
    }
  });
};


const UploadImage = async(req,callBack)=>{
  try {
    console.log("HIIIIIIIIIIIIIIIIIIIIIIIIII");
    console.log(req.file);
    const { personid } = req.query;
      console.log(personid)
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_1,
      Key: personid,
      Body: req.file,
      ACL: "public-read-write",
      ContentType: req.body.FileFormat
    };

    // Uploading the image to S3 bucket
    const data = await new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          console.log(err)
          reject(err);
        } else {
         
          resolve(data);
        }
      });
    });
//console.log(data.Location)
    // Constructing the SQL query to update the person table
    const Profile = `UPDATE person SET profilepic = '${data.Location}' WHERE empid = '${personid}'`;

    // Executing the SQL query
    await new Promise((resolve, reject) => {
      dbConn.query(Profile, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return callBack({ msg: 'Uploaded Image' })
  } catch (error) {
   return callBack(error)
  }  
}


const UploadJoiningForms = async(req,callBack)=>{
  try {
    console.log("HIIIIIIIIIIIIIIIIIIIIIIIIII");
    console.log(req.file);
    const { personid } = req.body;
      console.log(personid)
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_2,
      Key: personid,
      Body: req.file.buffer,
      ACL: "public-read-write",
      ContentType: req.body.FileFormat
    };

    // Uploading the image to S3 bucket
    const data = await new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          console.log(err)
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // Constructing the SQL query to update the person table
    const Profile = `UPDATE familycontactdetails f SET f.joiningforms = '${data.Location}' WHERE f.entityid = '${personid}'`;

    // Executing the SQL query
    await new Promise((resolve, reject) => {
      dbConn.query(Profile, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return callBack({ msg: 'Uploaded Image' })
  } catch (error) {
   return callBack(error)
  }  
}
AWS.config.update({region: 'ap-south-1'})

const credential = new AWS.Credentials({
 accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
})

AWS.config.credentials = credential
const recognition = new AWS.Rekognition()









/*** Face Recongnition Function */
const faceRecokgnition = (sourceImage,targetImage)=>{


  return new Promise((resolve, reject)=>{
    const params = {
      SourceImage: {
        S3Object: {
          Bucket: process.env.AWS_BUCKET_1,
          Name: sourceImage // Assuming sourceImage is the object uploaded from the frontend
        }
      },
      TargetImage: {
        Bytes: targetImage // Assuming targetImage is the object uploaded from the frontend
      },
      SimilarityThreshold: 97 // Adjust threshold as needed
    };
     // Use a promise to handle the asynchronous operation
     recognition.compareFaces(params, (err, data) => {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err); // Reject the promise with the error
      } else {
        console.log(data); // successful response
        if (data.FaceMatches.length > 0) {
         // const similarity = data.FaceMatches[0].Similarity;
          resolve(`Faces are similar`); // Resolve the promise with the result
        } else {
          resolve(`Faces are not similar`); // Resolve the promise with the result
        }
      }
    });
  })
}


/*** Controller for CompareFace route */
const CompareFaces = async (req, callBack) => {
console.log(req.file,req.query)
const {employeeid} = req.query

  //const query = `select personid from person where empid = '${employeeid}'`
  try{
  const data = await faceRecokgnition(`${employeeid}`, req.file.buffer);
  if(data === 'Faces are similar'){
    var query =
    "call spAddAttendance('" + employeeid + "')";
    dbConn.query(query, (err, results, fields) => {
      if (err) {
       throw err
        
      } else {
        console.log("Attendance successfully.");
        
      }
     // return callBack('Attendance Marked')
    });
    return  callBack('Attendance Marked')
   }else{
    return callBack('Face is not similar')
   }
   }catch(err){
    return callBack({msg:err})
   }

//   try {
//     dbConn.query(query,async(err,result)=>{
//       if(err){

       
//        return callBack(err)
//       }else{
//        // console.log(result[0].personid)
//        try{
       
//           console.log(result[0].personid)
//           console.log(req.file);
         
   
         
//        }catch(err){
//          return callBack(err)
//        }
    
//       }
//       // const data = await faceRecokgnition( req.file.buffer);

     
//     })
   
//   } catch (error) {
//     console.error('Error comparing faces:', error);
//  return  callBack(error)
//   }
};

function getEmployeeDataModel(userReqData, callBack) {
  var getData =
    "CALL spGetAllEmployeeList()";
  dbConn.query(getData, (err, results, fields) => {
    if (err) {
      console.log("Error while geting data");
      callBack(err);
    } else {
      console.log("Data get successfully");
      return callBack(null, results);
    }
  });
};


const NewsModel = { 
  
  createEmployeeModel: createEmployeeModel,
  getEmployeeDataModel: getEmployeeDataModel, 
  UploadImage,
  UploadJoiningForms,
 CompareFaces
}
module.exports = NewsModel;
