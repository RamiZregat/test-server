"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");
const server = express();
server.use(cors());
const PORT = process.env.PORT;
server.use(express.json());
const mongoose = require('mongoose');

main().catch(err => console.log(err));
let Flower;
async function main() {
    

//   await mongoose.connect('mongodb://localhost:27017/flowers');
  await mongoose.connect(process.env.MONGO_URL);

const flowerSchema = new mongoose.Schema({
    email: String,
    instructions: String,
    photo: String,
    name: String,
  });

   Flower = mongoose.model('flowers', flowerSchema);

//   testMongoFunction();
}
async function  testMongoFunction (){
    const sample = new Flower({ 
        photo:"url",
        instructions:"something",
        name:"name"
    });
    await sample.save();
}
//http://localhost:3100/
server.get("/",Homepage)
//http://localhost:3100/flowers
server.get("/flowers", gettingDataHandler);
//http://localhost:3100/addflower
server.post("/addflower",addFlowerHandler)
//http://localhost:3100/myfavourite?email=${email}
server.get("/myfavourite",gettingMongoDataHandler)
//http://localhost:3100/updateflower/${:id}
server.put("/updateflower/:id",updateFlowerHandler)
//http://localhost:3100/deleteflower/${:id}?email=${email}
server.delete("/deleteflower/:id",deleteFlowerHandler)

function Homepage(req,res){
    res.send("server is live")
}

function gettingDataHandler(req, res) {
  let flowerArray = [];
  axios
    .get(`https://flowers-api-13.herokuapp.com/getFlowers`)
    .then((result) => {
      flowerArray = result.data.flowerslist.map((item) => {
        return item;
      });
      res.send(flowerArray);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
}

async function addFlowerHandler(req,res){

    const {instructions,photo,name,email}=req.body
    await Flower.create({
        instructions:instructions,
        photo:photo,
        name:name,
        email:email
    })
    Flower.find({email:email},(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.send(result)
        }
    })
}

function gettingMongoDataHandler(req,res){
    const email=req.query.email
    Flower.find({email:email},(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.send(result)
        }
    })
}

async function updateFlowerHandler(req,res){
    const id = req.params.id

    const {email,name,instructions}=req.body

    Flower.findByIdAndUpdate(id,{name,instructions},(err,result)=>{
        Flower.find({email:email},(err,result)=>{
            if(err){
                console.log(err);
            }else{
                res.send(result)
            }
        })
    })
}


function deleteFlowerHandler(req,res){
        const id=req.params.id
        const email=req.query.email
    Flower.deleteOne({_id:id},(err,result)=>{
        Flower.find({email:email},(err,result)=>{
            if(err){
                console.log(err);
            }else{
                res.send(result)
            }
        })
    })
}

server.listen(PORT, () => {
  console.log("in PortNumber" + PORT);
});
