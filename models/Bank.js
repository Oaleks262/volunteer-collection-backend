import mongoose from "mongoose";

const BankSchema = new mongoose.Schema({

    bank: {
        type: String,
        required: true,
    }
})

export default mongoose.model('Bank' , BankSchema);