const express = require('express')
const mongoose = require('mongoose')
const Product = require("../models/Product")
const Category = require("../models/Category")

//const fuzzysort = require('fuzzysort')

const router = express.Router();

const str1 = 'hitting';
const str2 = 'kitten';
const levenshteinDistance = (str1 = '', str2 = '') => {
   const track = Array(str2.length + 1).fill(null).map(() =>
   Array(str1.length + 1).fill(null));
   for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
   }
   for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
   }
   for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
         const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
         track[j][i] = Math.min(
            track[j][i - 1] + 1, // deletion
            track[j - 1][i] + 1, // insertion
            track[j - 1][i - 1] + indicator, // substitution
         );
      }
   }
   return track[str2.length][str1.length];
};
//console.log(levenshteinDistance(str1, str2));

const capitalize = ([first,...rest]) => first.toUpperCase() + rest.join('').toLowerCase();
/*
function containsCard(card, list) {​
    return list.some(function(elem) {
         return elem._id === card._id
    })
}
/*
function addRecomm(Recomm , Results){
    
}*/

router.get('/', async(req,res)=>{
    const products  = await Product.find({})
    products.sort((b,a) => a.rating - b.rating)
    res.send({products})
})

router.post('/new', async(req,res)=>{
    const {name,category} = req.body
    const newProduct  = new Product({name,category})
    await newProduct.save();
    res.send({newProduct})
})

router.post('/search',async(req,res)=>{
    const {q} = req.query
    console.log(typeof(q))
    const regex = new RegExp(escapeRegex(q), 'gi');
    const products= await Product.find({name: regex})
    res.send({products})
})

router.post('/searchCatg',async(req,res)=>{
    let {q} = req.query
    const keywords = q.split(' ');
    console.log(keywords)
    let Categories= await Category.find({})
    let Recomm = [],min=Number.MAX_SAFE_INTEGER, result, minCatg=[];
    let Results;
    for(let key of keywords){
        key = capitalize(key);
        Results= Categories
                        .map(obj=> 
                            ({
                                ...obj._doc,
                                LEVD5: levenshteinDistance(key,obj._doc.category5),
                                LEVD4: levenshteinDistance(key,obj._doc.category4),
                                LEVD3: levenshteinDistance(key,obj._doc.category3),
                                LEVD2: levenshteinDistance(key,obj._doc.category2),
                                LEVD1: levenshteinDistance(key,obj._doc.category1),
                            }))

        console.log(`${key} \n====================\n`)
        Results.sort((a,b)=> (a.LEVD5 - b.LEVD5));
        min = Math.min(min,Results[0].LEVD5)
        result = Results[0].category5;
        //console.log(`Category 5: ${result} : ${max}\n`);

        Results.sort((a,b)=> (a.LEVD4 - b.LEVD4));
        min = Math.min(min,Results[0].LEVD4)
        result = (Results[0].LEVD4 == min ? Results[0].category4 : result);
        //console.log(`Category 4: ${result} : ${max}\n`);

        Results.sort((a,b)=> (a.LEVD3 - b.LEVD3));
        min = Math.min(min,Results[0].LEVD3)
        result = (Results[0].LEVD3 == min ? Results[0].category3 : result);
        //console.log(`Category 3: ${result} : ${max}\n`);

        Results.sort((a,b)=> (a.LEVD2 - b.LEVD2));
        min = Math.min(min,Results[0].LEVD2)
        result = (Results[0].LEVD2 == min ? Results[0].category2 : result);
        //console.log(`Category 2: ${result} : ${max}\n`);

        Results.sort((a,b)=> (a.LEVD1 - b.LEVD1));
        min = Math.min(min,Results[0].LEVD1)
        result = (Results[0].LEVD1 == min ? Results[0].category1 : result);
        console.log(`${result} : ${min}\n`);
    }
    
    res.send({Results})
    //res.send({Categories})
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router
