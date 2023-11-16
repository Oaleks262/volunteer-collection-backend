import mongoose from "mongoose";

const TitleSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        maxlength: 200,
    }
})

export default mongoose.model('Title' , TitleSchema);