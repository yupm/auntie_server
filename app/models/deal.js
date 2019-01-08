const mongoose = require('mongoose');
const { Schema } = mongoose;

var dealSchema = new Schema({
    title: String,
    company: String,
    from: Date,
    to: Date,
    description: String,
    filename: String,
    url: String
});

mongoose.model('deal', dealSchema);