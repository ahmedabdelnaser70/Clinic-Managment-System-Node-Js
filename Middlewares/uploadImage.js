const multer = require("multer");

const multerStorageDoctor = multer.diskStorage({
   destination: (request, file, cb) => {
      cb(null, "./uploads/images/doctors");
   },
   filename: function (request, file, cb) {
      // let extension = file.originalname.split(".")[file.originalname.split(".").length - 1]
      return cb(null, request.params.id + ".png");
   },
});

const multerStoragePatient = multer.diskStorage({
   destination: (request, file, cb) => {
      cb(null, "./uploads/images/patients");
   },
   filename: function (request, file, cb) {
      return cb(null, file.originalname);
   },
});

const multerStorageEmployee = multer.diskStorage({
   destination: (request, file, cb) => {
      cb(null, "./uploads/images/employees");
   },
   filename: function (request, file, cb) {
      return cb(null, file.originalname);
   },
});

const multerFilter = (request, file, cb) => {
   if (file.mimetype.startsWith("image")) {
      cb(null, true);
   } else {
      cb("Not an image! please upload only image.", false);
   }
};

const uploadDoctor = multer({
   storage: multerStorageDoctor,
   limits: { fileSize: 1024 * 1024 * 5 },
   fileFilter: multerFilter,
}).single("image");

const uploadPatient = multer({
   storage: multerStoragePatient,
   limits: { fileSize: 1024 * 1024 * 5 },
   fileFilter: multerFilter,
}).single("image");

const uploadEmployee = multer({
   storage: multerStorageEmployee,
   limits: { fileSize: 1024 * 1024 * 5 },
   fileFilter: multerFilter,
}).single("image");

module.exports = {uploadDoctor, uploadEmployee, uploadPatient};
