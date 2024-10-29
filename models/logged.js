const mongoose = require('mongoose');

// mongoose.connect("mongodb://127.0.0.1:27017/testapp2");
mongoose.connect("mongodb+srv://naiksneh6:snehnischal@notes-user-db.plfxt.mongodb.net/notes-app")
// retryWrites=true&w=majority&appName=notes-user-db

const logSchema=mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

module.exports=mongoose.model('loggeduser', logSchema);