const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    message:{
        type: String
    },
    scheduledAt:{
        type: Date
    }
});

const Message = mongoose.model('Message',messageSchema);

module.exports = Message;
