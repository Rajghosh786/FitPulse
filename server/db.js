const mongoose = require("mongoose")


const connectingDB = ()=>{
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("connected to DB")
    } catch (error) {
        console.log("error connecting DB",error)
    }
}

module.exports = {connectingDB}