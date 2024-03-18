const mongoose = require ('mongoose');


const AgentSchema = mongoose.Schema({
    name:{
        type: String
    }
});


const Agent = mongoose.model('Agent',AgentSchema);

module.exports = Agent;


