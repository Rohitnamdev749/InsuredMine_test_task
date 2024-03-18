const mongoose = require ('mongoose');


const CarrierSchema = mongoose.Schema({
    companyName:{
        type:String
    }
});


const Carrier = mongoose.model('Carrier',CarrierSchema);

module.exports = Carrier;


