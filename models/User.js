import mongoose from "mongoose";


const walletSchema = new mongoose.Schema({
    BTC:{
        type:Number,
        default:1.0
    },
    ETH:{
        type:Number,
        default:2.0
    }
});

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    wallet:{
        type : walletSchema,
        default : () => ({})
    }
},{ timestamps:true })

export default mongoose.model('User', userSchema);