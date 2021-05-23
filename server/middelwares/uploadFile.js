const multer = require("multer");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __basedir +"/uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-product${req.params.productID}-${file.originalname}`);
    },
  });

uploadFile = multer({ storage: storage })
module.exports = uploadFile;
