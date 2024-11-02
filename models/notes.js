const mongoose = require('mongoose');
require('dotenv').config();

// mongoose.connect("mongodb://127.0.0.1:27017/testapp2");
// mongoose.connect("mongodb+srv://naiksneh6:snehnischal@notes-user-db.plfxt.mongodb.net/notes-app")
const mongoURL=process.env.DB_URL
mongoose.connect(mongoURL)

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
}, { timestamps: true })

module.exports=mongoose.model('notes', noteSchema);