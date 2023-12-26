const mongoose = require("mongoose");

const TitleSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        maxlength: 200,
    }
})

module.exports = mongoose.model('Title' , TitleSchema);