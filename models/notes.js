const mongoose = require('mongoose');

// mongoose.connect("mongodb://127.0.0.1:27017/testapp2");
mongoose.connect("mongodb+srv://naiksneh6:snehnischal@notes-user-db.plfxt.mongodb.net/notes-app")

const noteSchema=mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: "Note"
    },
    content: {
        type: String
    }
})

module.exports=mongoose.model('notes', noteSchema);