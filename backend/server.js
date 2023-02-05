const express = require("express")
const app = express()
const path = require("path")
const {logger} = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const PORT = process.env.PORT || 3500;


app.use(express.json());

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

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})