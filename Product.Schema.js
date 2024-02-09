const mongoose = require('mongoose')
const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    productImage: { type: String }
},{
    versionKey:false
})

const Product = mongoose.model('product', ProductSchema)

module.exports = {Product}