const mongoose = require ('mongoose');


const LobSchema = mongoose.Schema({
    categoryName:{
        type: String
    }
});


const Lob = mongoose.model('Lob',LobSchema);

module.exports = Lob;


