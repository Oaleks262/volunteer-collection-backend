import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema({

    about: {
        type: String,
        required: true,
        maxlength: 400,
    }
})

export default mongoose.model('About' , AboutSchema);