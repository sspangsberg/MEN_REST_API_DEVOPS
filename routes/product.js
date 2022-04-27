const router = require("express").Router();
const product = require("../models/product");
const { verifyToken } = require("../validation");
const NodeCache = require('node-cache');
// stdTTL is the default time-to-live for each cache entry
const cache = new NodeCache({ stdTTL: 600 });


// CRUD operations

// Create product (post)
router.post("/", verifyToken, (req, res) => {
    data = req.body;

    product.insertMany(data)
        .then(data => { 
            cache.flushAll(); //our cache has invalid data now, so we flush it to force rebuild.
            res.status(201).send(data);            
        })
        .catch(err => {
            res.status(500).send({ message: err.message })
        })
});

// Read all products (get)
router.get("/", async (req, res) => {
    try {
        // try to retrieve our products in cache
        let productsCache = cache.get('allProducts');

        // if data does not exist in the cache, retrieve it from the DB
        if (productsCache == null) {
            console.log("No cache found. Fetching from DB...");            
            let data = await product.find();
            
            // set custom TTL if we need it (otherwise it will default to standard)
            // time-to-live is set to 300 seconds. After this period
            // the entry for `allProducts` will be removed from the cache
            // and the next request will hit the API again
            const timeToLive = 300;             
            cache.set('allProducts', data, timeToLive);
                
            res.send(mapArray(data));                             
        }
        else
        {          
            console.log("Cache found :)");
            res.send(mapArray(productsCache));
        }
    }
    catch (err) {        
        res.status(500).send({ message: err.message });
    }   
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
router.put("/:id", verifyToken, (req, res) => {

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
router.delete("/:id", verifyToken, (req, res) => {

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
            console.debug(err);
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