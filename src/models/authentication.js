var dbConn = require("../../config/db.config");
const nodemailer = require('nodemailer')
var crypto = require("crypto");
var async = require("async");
const bcrypt = require("bcrypt");
const AWS = require('aws-sdk');
const { resolve } = require("path");
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
require('dotenv').config()

/** nodemailer configuration */
var transport = nodemailer.createTransport({
  service:'gmail',
   auth: {
            user:'bhanu.galo@gmail.com',
            pass:'twod iufn mddq shsr'
        }
   });
/** Generating Password */
function generatePassword() {
  /** Generate a random password */
  const password = Math.floor(1000 + Math.random() * 9000);
  return password; 
}

AWS.config.update({region: 'ap-south-1'})

const credentials = new AWS.Credentials({
 accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
})

AWS.config.credentials = credentials

const login = async(userReqData,callBack)=>{
    const {empid,password} = userReqData.body

    const query = `CALL spGetReportingManager('${empid}')`

    try{
  const result = await new Promise((resolve,reject)=>{
        dbConn.query(query,(err,result)=>{
           if(err){
            console.log(err)
            reject(err)
           }else{
           resolve(result)
           }
           
        })
  })

console.log(result)
 if(result[0].length){
   try{
    const data = await bcrypt.compare(password,result[0][0].password)

    delete result[0][0]['password']
   return data?callBack(null,result[0][0]):callBack(null,'Wrong Password Entered')
   }catch(err){
     return callBack(null,`something went wrong during comparing password`)
   }
 }else{
return callBack(null,'Employee Does not exists')
 }
    }catch(err){
    return  callBack(err)
    }
}
async function createEmployeeModel(userReqData, callBack) {
  const { employeeid, fullname, personalemailid, designation, personalmobilenumber } = userReqData.body;
  const PhoneNumber = personalmobilenumber.split('');
  const pass = `${PhoneNumber[6]}${PhoneNumber[7]}${PhoneNumber[8]}${PhoneNumber[9]}@${generatePassword()}`;
  
  if (
    designation == 'HR' ||
    designation == 'Reporting Manager' ||
    designation == 'Admin' ||
    designation == 'SuperAdmin'
  ) {
    try {
      // Hash the password asynchronously
      const hashedPassword = await bcrypt.hash(pass, 8);
      userReqData.body.password = hashedPassword;
    } catch (error) {
      console.error('Error hashing password:', error);
      return callBack( error);
    }
  }

 
  
  const query = "call spAddEditemployee('" + JSON.stringify(userReqData.body) + "')";
  
  try {
    const results = await new Promise((resolve, reject) => {
      dbConn.query(query, (err, results, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Send email
    await transport.sendMail({
      from: 'bhanu.galo@gmail.com',
      cc: 'bhanu.galo@gmail.com',
      to: personalemailid,
      subject: 'Enrollment in Galo Energy Private Limited',
      html: `<div style="position: relative; padding: 5px;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('https://galo.co.in/wp-content/uploads/2024/01/Galo-Energy-Logo-06.png'); background-size: cover; background-position: center; background-repeat: no-repeat; opacity: 0.3; z-index: -1;"></div>
        <div style="background-color: rgba(255, 255, 255, 0.8); padding: 20px; border-radius: 10px;">
          <h3 style="color: #2f4f4f;">Welcome to Galo Energy Private Limited!</h3>
          <p style="font-size: 16px;">Dear ${fullname},</p>      
          <p style="font-size: 16px; margin-bottom: 0px;">Congratulations, you are now officially enrolled in Galo Energy Private Limited.</p>      
          <p style="font-size: 16px;">Below are your enrollment details:</p>
          <ul style="font-size: 16px;">
            <li><strong>Employee ID:</strong> ${employeeid}</li>
            <li><strong>Password:</strong> ${pass}</li>
          </ul>
          <p style="font-size: 16px; margin-bottom: 0px;">Please keep your Employee ID and Password confidential for security reasons.</p>        
          <p style="font-size: 16px; margin-bottom: 0px;">If you have any questions or need assistance, feel free to contact us at <a href="mailto:info@galoenergy.com" style="color: #007bff;">info@galoenergy.com</a>.</p>
          <p style="font-size: 16px;">We look forward to working with you!</p>
          <br>
          <p style="font-size: 16px;"><em>Sincerely,</em></p>
          <p style="font-size: 16px;"><strong>Galo Energy HR Team</strong></p>
        </div>
      </div>`
    });

    console.log("Employee registered successfully.");
    return callBack(null, results);
  } catch (error) {
    console.error("Error while creating news:", error);
    return callBack(error);
  }
}


const UploadImage = async(req,callBack)=>{
  try {
    console.log("HIIIIIIIIIIIIIIIIIIIIIIIIII");
    console.log(req.file.buffer);
    const { personid } = req.query;
      console.log(personid)
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_1,
      Key: personid,
      Body: `${req.file.buffer}`,
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

    return callBack('Uploaded Image')
  } catch (error) {
   return callBack(error)
  }  
}


const UploadJoiningForms = async(req,callBack)=>{
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

    return callBack('Uploaded File')
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
    return callBack(err.Message)
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
  const {personid} = userReqData
  var getData =
    `CALL spGetAllEmployeeList('${personid}')`;
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

const sendSms = (req,callBack)=>{
  AWS.config.update({region: 'ap-south-1'})

const credentials = new AWS.Credentials({
 accessKeyId: process.env.AWS_ACCESS_KEY_ID,
 secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
})

AWS.config.credentials = credentials

  const       
  publishSms = new AWS.SNS({apiVersion:'2010-03-31'}).publish({
    // PhoneNumber:'+919718537367',                  
    Message:'Hii',
    TopicArn:'arn:aws:sns:ap-south-1:217206456407:Galo-Energy'
    
  }).promise()

  
  publishSms.then((data)=>{
    callBack(data)
  }).catch((err)=>{
    callBack(err)
  })

}


const getDepartmentList = ((req,callBack)=>{
  var getData =
  "CALL spGetDepartmentList()";
dbConn.query(getData,async(err, results, fields) => {
  if (err) {
    console.log("Error while geting data");
    callBack(err);
  } else {
    console.log("Data get successfully");
    return callBack(null, results);
  }
});

})

const getDesignationList = ((req,callBack)=>{
  const {departmentid} = req.body
  console.log(req.body)
  var getData =
  `CALL spGetDesignationList('${departmentid}')`;
dbConn.query(getData,async(err, results, fields) => {
  if (err) {
    console.log("Error while geting data");
    callBack(err);
  } else {
    console.log("Data get successfully");
    return callBack(null, results);
  }
});

})


const getReportingManagerList = ((req,callBack)=>{
  console.log(req.body)
  var getData =
  `CALL spGetDesignation()`;
dbConn.query(getData,async(err, results, fields) => {
  if (err) {
    console.log("Error while geting data");
    callBack(err);
  } else {
    console.log("Data get successfully");
    return callBack(null, results);
  }
});
})



const ExternalAttendance = async(req,callBack)=>{
   const {empid}= req.body;
   console.log(empid)
try{
const result = await new Promise((resolve,reject)=>{
     const query = "call spAddAttendance('" + empid + "')";
      dbConn.query(query, (err, results, fields) => {
        if (err) {

          reject(err)

        } else {

          console.log("Attendance successfully. External");
        resolve(results)

        }
      
      });
    })
console.log(result)
   return callBack(null,'Attendance Marked.')

  }catch(err){
    return callBack('Attendance Failed.')
  }
}
const NewsModel = { 
  
  createEmployeeModel: createEmployeeModel,
  getEmployeeDataModel: getEmployeeDataModel, 
  UploadImage,
  UploadJoiningForms,
 CompareFaces,
 sendSms,
 getDepartmentList,
 getDesignationList,
 getReportingManagerList,
 login,
 ExternalAttendance
}
module.exports = NewsModel;
