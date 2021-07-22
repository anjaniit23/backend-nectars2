
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    category1: {
        type: String,
        required: true,
    },
    category2: {
        type: String,
        required: true,
    },
    category3: {
        type: String,
        required: true,
    },
    category4: {
        type: String,
        required: true,
    },
    category5: {
        type: String,
        required: true,
    },
},{ timestamps: true});



const Category = mongoose.model('Category', CategorySchema);
module.exports = Category;