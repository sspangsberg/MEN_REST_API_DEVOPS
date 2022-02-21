const router = require("express").Router();
const product = require("../models/product");

// CRUD operations

// Create product (post)
router.post("/", (req, res) => {
    data = req.body;

    product.insertMany(data)
        .then(data => { 
            res.send(data); 
            console.log(data[0]._id.toString());
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
});

// Read all products (get)
router.get("/", (req, res) => {
    product.find()
        .then(data => {  
            
            res.send(mapArray(data));        
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
});

//Additional routes
//Query all products based on stock status
router.get("/instock/:status", (req, res) => {
    product.find({ inStock: req.params.status }) 
        .then(data => { 
            res.send(mapArray(data));  
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
});



router.get("/price/:operator/:price", (req, res) => {
    
    const operator = req.params.operator;
    const price = req.params.price;

    let filterExpr = { $lte: req.params.price };

    if (operator == "gt") {
        filterExpr = { $gte: req.params.price };
    }        

    product.find({ price : filterExpr})    
        .then(data => { res.send(data) })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
});



//Read specific product based on id (get)
router.get("/:id", (req, res) => {
    product.findById(req.params.id)
        .then(data => { res.send(data) })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })


});

// Update specific product (put)
router.put("/:id", (req, res) => {

    const id = req.params.id;
    product.findByIdAndUpdate(id, req.body)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Cannot update product with id=" + id + ". Maybe the product was not found!" });
            }
            else {
                res.send({ message: "Product was successfully updated." });
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error updating product with id=" + id })
        })
});

// Delete specific product (delete)
router.delete("/:id", (req, res) => {
x$
    const id = req.params.id;
    product.findByIdAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Cannot delete product with id=" + id + ". Maybe the product was not found!" });
            }
            else {
                res.send({ message: "Product was successfully deleted." });
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error deleting product with id=" + id })
        })
});


function mapArray(arr) {

    let outputArr = arr.map(element => ( 
        {
            id: element._id,
            name: element.name,
            description: element.description,
            price: element.price,
            inStock: element.inStock,
            //link urln
            uri: "/api/products/" + element._id,
        }
    )); 
    
    return outputArr;
}


module.exports = router;