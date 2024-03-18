const mongoose = require('mongoose');


const connectDB = async() => {
    try{
        const conn = await mongoose.connect("mongodb://localhost:27017/insurancedb", {
            useNewUrlParser: true,
          })
          console.log(`database connection done successfully: ${conn.connection.host}`);
    }catch(e){

    }
}

module.exports = connectDB;
