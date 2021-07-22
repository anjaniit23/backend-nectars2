//category
//  ->subcategory

//Beauty / Skin / Medicine / 
// Beauty -> soap/himalaya/aloevera/digestion
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    rating: Number,
    category: {
        ref: "Category",
        type: mongoose.Schema.Types.ObjectId,
    },
},{ timestamps: true});


const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;