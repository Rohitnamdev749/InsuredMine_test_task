const mongoose = require ('mongoose');


const PolicySchema = mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Lob',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Carrier',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


const Policy = mongoose.model('Policy',PolicySchema);

module.exports = Policy;


