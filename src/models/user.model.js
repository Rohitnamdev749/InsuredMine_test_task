const mongoose = require ('mongoose');


const UserSchema = mongoose.Schema({
    firstName:{
        type: String
    },
    dob:{
        type:Date
    }, 
    address:{
        type:String
    }, 
    phoneNumber:{
        type:String
    }, 
    state:{
        type:String
    }, 
    zip:{
        type:String
    }, 
    email:{
        type: String
    }, 
    gender:{
        type:String
    }, 
    userType:{
        type:String
    }
});


const User = mongoose.model('User',UserSchema);

module.exports = User;


