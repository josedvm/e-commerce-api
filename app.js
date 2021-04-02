require("dotenv/config")
const express = require("express")
const app = express();
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors =require('cors')

/* import Routes */
const productsRoutes = require('./routers/products') //router to paths of products
const categoriesRoutes = require('./routers/categories') //router to paths of categories
const ordersRoutes = require('./routers/orders') //router to paths of orders
const usersRoutes = require('./routers/users') //router to paths of users


const api = process.env.API_URL
const pass = process.env.PASS

/* middleware */
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.options('*',cors())

/* Routers */
app.use(`${api}/products`,productsRoutes) //use the router to products
app.use(`${api}/categories`,categoriesRoutes) //use the router to categories
app.use(`${api}/orders`,ordersRoutes) //use the router to orders
app.use(`${api}/users`,usersRoutes) //use the router to users


/* http://localhost:3000/api/v1/products */

/* connection to database */
mongoose.connect(`mongodb+srv://eshop-user:${pass}@cluster0.bwlkz.mongodb.net/eshop-database?retryWrites=true&w=majority`,
{   
    useUnifiedTopology: true,
    useNewUrlParser: true 
})
.then(()=>{
    console.log('connected :D')
})
.catch((err)=>{
    console.log(err)
})

/* port that listen the app */
app.listen(3000,()=>{
    console.log(api)
    console.log(pass)
    console.log("it is aliveee http:localhost:3000")
})