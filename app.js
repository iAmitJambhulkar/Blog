const { render } = require('ejs');
const express = require('express');
require('dotenv').config();
const path = require("path");
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog')
const Blog = require('./models/blog')
const cookieParser = require('cookie-parser');

const { default: mongoose } = require('mongoose');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const app = express();
const PORT = process.env.PORT || 8000;

mongoose
.connect(process.env.MONGO_URL)
.then((e)=> console.log('Mongodb connected'));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({extended: false}));

app.use(cookieParser());

app.use(express.static(path.resolve('./public')))

app.use(checkForAuthenticationCookie("token"))

app.get('/', async(req, res) => {
    const allBlogs = await Blog.find({});
    res.render("home",{
        user: req.user,
        blogs: allBlogs,
    });
})

app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));