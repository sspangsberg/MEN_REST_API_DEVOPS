const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let productSchema = new Schema(

    {
        name: {type: String},
        desciption: {type:String},
        price: {type: Number},
        inStock: {type: Boolean}
    }
    //name: string
    //description: string
    //price: number
    //inStock: boolean

    
);

module.exports = mongoose.model("product", productSchema);