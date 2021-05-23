const express = require('express');
const router = express.Router();

const orders= require('../controllers/orders');
const isAuth = require('../middelwares/isAuth');



router.post('/addOrder', isAuth ,orders.addOrder);

router.get('/getAllOrders',isAuth, orders.getAllOrders)
router.post('/updateOrder',isAuth, orders.updateOrder)

router.get('/getUserOrders', isAuth ,orders.getUserOrders)


module.exports = router