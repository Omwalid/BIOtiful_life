const express = require('express');
const router = express.Router();

const store= require('../controllers/store');
const isAuth = require('../middelwares/isAuth');
const upload = require("../middelwares/uploadFile");

router.get('/getStock/:kind', store.getStock)

router.get('/getProduct/:id', store.getProduct)


router.post('/:productID/uploadfile',isAuth, upload.single("image"), store.uploadImg)


router.post('/updateProduct',isAuth, store.updateProduct)
router.delete('/deleteProduct/:productId&:productName',isAuth, store.deleteProduct)

router.post('/addProduct',isAuth, store.addProduct);


module.exports = router
