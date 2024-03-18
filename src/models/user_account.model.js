const mongoose = require ('mongoose');


const UserAccountSchema = mongoose.Schema({
    accountName:{
        type: String,
        unique: true,
    }
});


const UserAccount = mongoose.model('UserAccount',UserAccountSchema);

module.exports = UserAccount;


