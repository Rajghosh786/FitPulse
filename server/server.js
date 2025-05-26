require("dotenv").config()
const express = require("express")
const { connectingDB } = require("./db");
const cors = require('cors')
const exerciseRoutes = require('./routes/exerciseRoutes')
const { userRouter } = require("./routes/user.route");
const workoutRouter = require('./routes/workout')
const app = express();


app.use(express.json());
app.use(cors());


app.use('/api/exercise', exerciseRoutes)
app.use("/user",userRouter);
app.use('/api/workouts', workoutRouter)

connectingDB()


app.use((req,res)=>{
    return res.status(404).json({msg:`Route Not Found`})
})

const port = process.env.port || 8000
app.listen(port,()=>{
    console.log(`Server connected on ${port} port`)
})