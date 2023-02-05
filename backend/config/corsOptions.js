const allowedOrigins = require('./allowedOrigins')
//checking if the allowed origin in the array are the same as origin, if not, it will
// not let the exchange of data
// || !origin will make sure that it will still let it through 
// because i still need to test my api on postman
const corsOptions = {
    origin: (origin,callback) => {
        if(allowedOrigins.indexOf(origin) !== -1  || !origin){
            callback(null, true)
        } else {
            callback(new Error('Not Allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}
module.exports = corsOptions