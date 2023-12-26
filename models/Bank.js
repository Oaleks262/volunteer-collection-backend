const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema({

    bank: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Bank' , BankSchema);