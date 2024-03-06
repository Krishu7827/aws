const AuthenticationService = require("../services/authentication.service")

const multer = require('multer')


const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
      cb(null, '')
  }
})



// below variable is define to check the type of file which is uploaded

const filefilter = (req, file, cb) => {

//console.log(req.file)
  req.body.FileFormat = file.mimetype
  cb(null, true)

}
const upload = multer({ storage: storage, fileFilter: filefilter });

module.exports = (router) => {
 
  router.post("/createEmployee", AuthenticationService.createEmployeeService); 
  router.post("/getEmployeeData", AuthenticationService.getEmployeeDataService);
  router.post('/uploadProfileImg',upload.single('Image'),AuthenticationService.uploadImage);
  router.post('/UploadJoiningForms',upload.single('File'),AuthenticationService.UploadJoiningForms);
  router.post('/FaceReckognition',upload.single('face'),AuthenticationService.CompareFunctionService)
  router.post('/sendSMS',AuthenticationService.SendSMS)
  router.get('/getDepartmentList',AuthenticationService.getDepartment)
  router.post('/getDesignationList',AuthenticationService.getDesignation)
  router.get('/getReportingManagers',AuthenticationService.getReportingManagers)
  router.post('/externalAttendance',AuthenticationService.ExternalAttendanceService)
  router.post('/login',AuthenticationService.Login)
}