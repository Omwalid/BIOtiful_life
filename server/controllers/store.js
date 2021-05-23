const util = require('util');
const fs = require("fs");
const con = require('../models/connect_db');


const query = util.promisify(con.query).bind(con);

exports.getStock = async (req, res) => {
    try {
        var check = ["others","all","fruits",'vegetables'].includes(req.params.kind)
        if (!check) return res.status(404).json({ stock: [] })

        var stock = (req.params.kind === "all") 
        ? await query("SELECT * FROM `v_get_stock`") 
        : await query("SELECT * FROM `v_get_stock` WHERE product_type=?",req.params.kind)
         
        stock = JSON.parse(JSON.stringify(stock))
        res.status(200).json({ stock: stock });
    } catch (e) {
        res.status(500).json({ stock: [] })
        throw (e)
    }
}

exports.getProduct = async (req, res) => {
    try {
        var product = await query("SELECT * FROM `v_get_stock` WHERE id=?",req.params.id)
        product = JSON.parse(JSON.stringify(product))

        if (!product[0]) {
            return res.status(404).json({product : {}});
        }
        res.status(200).json({ product: product[0] });
    } catch (e) {
        res.status(500).json({ product: [] })
        throw (e)
    }
}


exports.addProduct = async (req, res, next) => {

    if(!(res.locals.role_id === 1)){
        return res.status(403).end()
    }
    
    var newProduct = JSON.stringify({
        product_name: req.body.productName,
        product_type: req.body.productType,
        unit_of_measure: req.body.unitOfMeasure,
        product_quantity: req.body.productQuantity,
        product_price: req.body.productPrice,
        product_description: req.body.productDescription,
    })

    
    try {
        var adding = await query('call p_add_product(\?\)',newProduct) 
        res.status(201).json({ product_added: true, product_id: adding[0][0].product_added_id})
    } catch (e) {
       if (e.message.includes('ER_DUP_ENTRY'))
        return res.status(409).json({ product_added: false, message: "product already exists" })
       else if (e.message.includes('ER_BAD_NULL_ERROR')) 
        return res.status(402).json({ product_added: false, message: "some inputs are null" })
    
        res.status(500).json({ product_added: false, message: "serverside problem" })
        throw e.message 
    }
}

exports.deleteProduct = async (req, res) => {
    if(!(res.locals.role_id === 1)){
        return res.status(403).end()
    }

    try {
        product_to_delete = JSON.stringify({
            product_id: req.params.productId,
            product_name: req.params.productName,
        })
        var productDelete = await query('call p_delete_product(\?\)', product_to_delete )
        if (productDelete.affectedRows === 0) {
            return res.status(409).json({ deleted: false, message: "no product to delete" });
        }
        res.status(200).json({ deleted: true });
    } catch (e) {
        res.status(500).end()
        throw (e)
    }
}

exports.updateProduct = async (req, res) => {
    if(!(res.locals.role_id === 1)){
        return res.status(403).end()
    }

    try {
        var productToUpdate = JSON.stringify({
            product_id: req.body.productId,
            product_name: req.body.productName,
            product_quantity: req.body.productQuantity,
            product_price: req.body.productPrice,
            product_description: req.body.productDescription,
        })
        var productUpdate = await query('call p_update_product(\?\)', productToUpdate )
        if (productUpdate.affectedRows === 0) {
            return res.status(409).json({ order_updated: false, message: "no product to update" });
        }
        res.status(200).json({ product_updated: true });
    } catch (e) {
        res.status(500).end()
        throw (e)
    }
}



exports.uploadImg = async (req, res) => {

  try {
    if(!(res.locals.role_id === 1)){
        return res.status(403).end()
    }

    if (req.file == undefined) {
        return res.status(400).json({message :'You must select a file.'});
      }
    else if (!req.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        return res.status(400).json({ message:'Only image files (jpg, jpeg, png, gif) are allowed!'})};
        
    var newImg = JSON.stringify({
        type: req.file.mimetype ,
        name: req.file.originalname,
        path: req.file.filename,
        product_id: req.params.productID
    })
    
    var addImg= await query("call p_add_image(\?\)",newImg)

    if (addImg[0][0].delete_previous === 1){
        fs.unlinkSync(__basedir+"/uploads/"+addImg[0][0].previous_image_path)
    }

      return res.status(201).json({message : "File has been uploaded."});

  } catch (error) {
    console.log(error);
    return res.status(500).json({message :'Error when trying upload image'});
  }


}