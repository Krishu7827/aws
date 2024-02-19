const express = require('express')
const {connect} = require('./db.config')
const multer = require('multer')              // multer will be used to handle the form data.
const Aws = require('aws-sdk')     
const {SNSClient,PublishCommand} = require('@aws-sdk/client-sns')           // aws-sdk library will used to upload image to s3 bucket.
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const {Product} = require('./Product.Schema')
const fs = require('fs')
require('dotenv').config()
const app = express()

let FileFormat = ''
// creating the storage variable to upload the file and providing the destination folder, 
// if nothing is provided in the callback it will get uploaded in main directory

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    }
})

// below variable is define to check the type of file which is uploaded

const filefilter = (req, file, cb) => {
    console.log(file.mimetype)
   
    FileFormat = file.mimetype
        cb(null, true)
  
}

// defining the upload variable for the configuration of photo being uploaded
const upload = multer({ storage: storage, fileFilter: filefilter });

// Now creating the S3 instance which will be used in uploading photo to s3 bucket.
const s3 = new Aws.S3({
    accessKeyId:process.env.AWS_ACCESS_KEY_ID,              // accessKeyId that is stored in .env file
    secretAccessKey:process.env.AWS_ACCESS_KEY_SECRET       // secretAccessKey is also store in .env file
})

// now how to handle the post request and to upload photo (upload photo using the key defined below in upload.single ie: productimage )
app.post('/',  upload.single('productimage'),async (req, res) => {
    console.log(req.file)  // to check the data in the console that is being uploaded
  
    // Definning the params variable to uplaod the photo
    
    const params = {
        Bucket:process.env.AWS_BUCKET_NAME,      // bucket that we made earlier
        Key:req.file.originalname,               // Name of the image
        Body:req.file.buffer,                    // Body which will contain the image in buffer format
        ACL:"public-read-write",                 // defining the permissions to get the public link
        ContentType:FileFormat                // Necessary to define the image content-type to view the photo in the browser with the link
    };
  
   // uplaoding the photo using s3 instance and saving the link in the database.
    
    s3.upload(params,async(error,data)=>{
        if(error){
            res.status(500).send({"err":error})  // if we get any error while uploading error message will be returned.
        }
  
   // If not then below code will be executed
        
    console.log(data)                      // this will give the information about the object in which photo is stored 
    
   // saving the information in the database.   
    const product = new Product({
            name: req.query.name,
            price: req.query.price,
            productImage: data.Location
        });
      await  product.save()
            .then(result => {
                res.status(200).send({
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    productImage: data.Location,
                })
            })
            .catch(err => {
                res.send({ message: err })
          })
    })
})

// Get all the product data from db 

   Aws.config.update({region: 'ap-south-1'})

   const credentials = new Aws.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET
   })

   Aws.config.credentials = credentials
   const recognition = new Aws.Rekognition()
 

// Modify the compareFaces function to accept source and target images as parameters
function compareFaces(sourceImage, targetImage) {
    const params = {
      SourceImage: {
        S3Object: {
          Bucket: process.env.AWS_BUCKET_NAME,
          Name: sourceImage // Assuming sourceImage is the object uploaded from the frontend
        }
      },
      TargetImage: {
        Bytes: targetImage // Assuming targetImage is the object uploaded from the frontend
      },
      SimilarityThreshold: 97 // Adjust threshold as needed
    };
  
    recognition.compareFaces(params, (err, data) => {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        console.log(data); // successful response
        if (data.FaceMatches.length > 0) {
          const similarity = data.FaceMatches[0].Similarity;
          console.log(`Faces are similar with similarity score: ${similarity}`);
        } else {
          console.log('Faces are not similar.');
        }
      }
    });
  }
  
  // Update Express route to handle the upload of source and target images from frontend
  app.post('/compareFaces', upload.single('targetImage'), (req, res) => {
    try {
      // Access source and target images uploaded from frontend
     
  
      // Call compareFaces function with source and target images
      compareFaces('Krishna.jpg', req.file.buffer);
  
      res.status(200).send('Comparison started successfully.');
    } catch (error) {
      console.error('Error comparing faces:', error);
      res.status(500).send('Error comparing faces.');
    }
  });
  















app.listen(process.env.PORT, async()=>{
  try{
     await connect
     console.log('Everything is running perfect')
  }catch(err){
console.log(err)
  }
})