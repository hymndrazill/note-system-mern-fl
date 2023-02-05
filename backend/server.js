require('dotenv').config()
const express = require("express")
const app = express()
const path = require("path")
const {logger} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const { logEvents  } = require('./middleware/logger')
const PORT = process.env.PORT || 3500;


app.use(express.json());

connectDB()

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(logger);

// public is a folder, but you can bypass the use of "/" 
// it won't cause any problems, express will know of it.
app.use('/',express.static(path.join(__dirname, 'public')))


app.use('/', require('./routes/root'))
 
app.all('*',(req,res)=> {
    res.status(404)
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')) {
        res.json({message : '404 Not Found'})
    } else {
        res.type('text').send('404 Not Found')
    }
})
app.use(errorHandler)
mongoose.connection.once('open', () => {
    console.log("connected to Mongodb")
    app.listen(PORT,()=>
        console.log(`server is running on ${PORT}`)
    )
})
mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrLog.log')
})
