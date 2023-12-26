const mongoose = require("mongoose");

const AboutSchema = new mongoose.Schema({

    about: {
        type: String,
        required: true,
        maxlength: 400,
    }
})

module.exports = mongoose.model('About' , AboutSchema);