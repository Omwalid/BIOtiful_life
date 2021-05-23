const util = require('util');
const con = require('../models/connect_db');


const query = util.promisify(con.query).bind(con);



exports.getAllOrders = async (req, res) => {
    if(!(res.locals.role_id === 1)){
        return res.status(403).end()
    }

    try {
        var orders = await query("SELECT * FROM `v_get_orders_for_admin`") 
        
        orders = JSON.parse(JSON.stringify(orders))
        res.status(200).json({ orders: orders });
    } catch (e) {
        res.status(500).json({ orders: [] })
        throw (e)
    }
}

exports.getUserOrders = async (req, res) => {
    try {
        var orders = await query("SELECT * FROM `v_get_orders_for_user` WHERE user_id=?",res.locals.user_id)
        orders = JSON.parse(JSON.stringify(orders))

        res.status(200).json({ orders: orders });
    } catch (e) {
        res.status(500).json({ orders: [] })
        throw (e)
    }
}

exports.addOrder = async (req, res, next) => {

    var newOrder = JSON.stringify({
        user_id: res.locals.user_id,
        product_id: req.body.productId,
        order_quantity: req.body.orderQuantity,
        user_address: req.body.userAddress,
        order_status_id : 1
    })
    try {
        var adding = await query('call p_add_order(\?\)',newOrder) 
        if (adding[0][0].added === 0)
        return res.status(403).json({ order_added: false,message: "there's not enough quantity"})

        
        res.status(201).json({ order_added: true, order_id: adding[0][0].order_added_id})
  

    } catch (e) {
       if (e.message.includes('ER_DUP_ENTRY'))
        return res.status(409).json({ order_added: false, message: "order already exists" })
       else if (e.message.includes('ER_BAD_NULL_ERROR')) 
        return res.status(400).json({ order_added: false, message: "some inputs are null" })
      
        res.status(500).json({ order_added: false, message: "serverside problem" })
        throw e.message 
    }
}

exports.updateOrder = async (req, res) => {
    if(!(res.locals.role_id === 1)){
        return res.status(403).end()
    }
    try {
        var orderToUpdate = JSON.stringify({
            order_id: req.body.ordertId,
            order_order_status_id: req.body.orderStatusId,
        })

        var orderUpdate = await query('call p_update_order_status(\?\)', orderToUpdate )
        if (orderUpdate.affectedRows === 0) {
            return res.status(409).json({ order_updated: false, message: "no order to update" });
        }
        res.status(200).json({ order_updated: true });
    } catch (e) {
        res.status(500).end()
        throw (e)
    }
}