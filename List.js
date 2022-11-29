const mongoose = require('mongoose');
const Item = require('./Items')

const listSchema = new mongoose.Schema(
    {
        name: String,
        items: [Item.schema]
    }
)

module.exports = mongoose.model("List", listSchema)