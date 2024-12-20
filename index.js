const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const loggedModel = require("./models/logged");
const notesModel = require("./models/notes");
const { render } = require("ejs");
require('dotenv').config();
const crypto = require('crypto');
const jwt=require("jsonwebtoken");
const {createToken, verifyToken}=require("./middleware/jwt_auth.js")
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret_key', // replace with a secure key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 24 * 60 * 60 * 1000 } //for 5 days
}));
app.use(flash());

app.set("view engine", "ejs");

// Middleware to check session for protected routes
// function isLoggedIn(req, res, next) {
//     if (req.session.username) {
//         return next();
//     }
//     res.redirect('/');
// }

// Routes
app.get('/',verifyToken ,(req, res) => {
    // console.log(req.session.username)
    if (req.username) {
        return res.redirect('/notes'); // Auto-login if session exists
    }
    const message = req.flash("message");
    res.render("index", { message });
});
app.get("/logout",(req,res)=>{
    req.session.username=undefined
    // Clear the JWT cookie
    res.clearCookie("auth_token", {
        httpOnly: true,
        secure: true, // Ensure this matches your cookie configuration
    });
    res.redirect("/")
})

app.get('/createuser', (req, res) => {
    const message = req.flash("message");  // Retrieve the flash message
    res.render("create", { message });
});

app.post("/createuser/create", async (req, res) => {
    try {
        let { uname, uemail, upassword } = req.body;

        // Check if the username already exists
        let existingUser = await loggedModel.findOne({ name: uname });
        if (existingUser) {
            // Username already exists
            console.log("Username already exists.");
            req.flash("message", "Username already exists");  // Set the flash message
            return res.redirect("/createuser");  // Redirect back to creation page
        }
        function hashPassword(password) {
            return crypto.createHash('sha256').update(password).digest('hex');
        }


        // Create the new user if the username doesn't exist
        let createdUser = await loggedModel.create({
            name: uname,
            email: uemail,
            password: hashPassword(upassword)
        });
        const token=createToken(createdUser.name);
        res.cookie("auth_token", token, {
            httpOnly: true, // Prevent client-side JavaScript access
            secure: true, // Use secure cookies in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration (7 days)
        });
        req.flash("message", "");
        res.redirect("/");
    } catch (error) {
        console.error("Error creating user:", error);
        req.flash("message", "An error occurred while creating user");  // Set error flash message
        res.redirect("/createuser");
    }
});
app.post("/logging", async (req, res) => {
    try {
        let { lname, lpassword } = req.body;
        function hashPassword(password) {
            return crypto.createHash('sha256').update(password).digest('hex');
        }
        
        // Find user with matching name and password
        let luser = await loggedModel.findOne({ name: lname, password: hashPassword(lpassword) });
        
        if (luser) {
            // res.send("User logged in successfully!");
            // req.flash("user", luser.name)
            const token=createToken(luser.name);
            // req.session.username=luser.name
            console.log(token);
            res.cookie("auth_token", token, {
                httpOnly: true, // Prevent client-side JavaScript access
                secure: true, // Use secure cookies in production with HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration (7 days)
            });
            res.redirect("/notes")
            // res.render('notes.ejs', {user: luser})
        } else {
            // res.status(400).send("Invalid username or password.");
            req.flash("message", "Invalid username or password")
            res.redirect("/")
        }
    } catch (error) {
        console.error("Error during login:", error);
        req.flash("message", "Invalid username or password")
        res.redirect("/")
    }
});
app.get('/notes',verifyToken ,async(req,res)=>{
    const uname=req.username;
    console.log(req.username)
    // if (!req.session.username) {
    //     // If session has expired, redirect to login page
    //     return res.redirect('/');
    // }
    // let allNotes=await notesModel.find({name: req.session.username})
    let allNotes=await notesModel.find({name: uname}).sort({ updatedAt: -1 })
    // const user=req.flash("user")
    // req.session.username=user
    res.render('notes', {user: uname, allnotes: allNotes})
})
app.post("/notes/add", async(req,res)=>{
    try{
        console.log(req.body);
        let { username, title, content } = req.body
        let createdNote = await notesModel.create({
            name: username,
            title: title,
            content: content
        });
        res.redirect("/notes")
    } catch (error) {
        console.log("Error occurred while adding a note")
        res.redirect("/notes")
    }
})
app.get("/notes/delete/:id", async(req,res)=>{
    let deletedNote=await notesModel.findOneAndDelete({_id: req.params.id})
    req.session.username=deletedNote.name
    res.redirect("/notes")
})
app.get("/notes/edit/:id", async(req,res)=>{
    console.log("params",req.params.id);
    let editNote=await notesModel.findOne({_id: req.params.id})
    req.session.username=editNote.name
    res.render("edit",{ etitle: editNote.title, etxt: editNote.content, eid: editNote._id })
})
app.post("/notes/edit/edited", async(req,res)=>{
    let { etitle, etxt, eid } = req.body
    let editedNote = await notesModel.findByIdAndUpdate(
        eid,  // The ID of the note to update
        { title: etitle, content: etxt }
    );
    req.session.username=editedNote.name
    res.redirect("/notes")
})
app.get("/notes/full/:id", async(req,res)=>{
    // console.log("body",req.body);
    console.log("params",req.params.id);
    let fullNote=await notesModel.findOne({_id: req.params.id})
    req.session.username=fullNote.name
    res.render("full", { ftitle:fullNote.title, ftext:fullNote.content })
})

const PORT=process.env.Port || 3000
app.listen(PORT, () => {
    console.log("Server is running on port 3000");
});
