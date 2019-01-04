const mongoose = require('mongoose');
const { Schema } = mongoose;

var postSchema = new Schema({
    title: String,
    poster: { type: Schema.Types.ObjectId, ref: 'user'},
    description: String,
    filename: String,
    topics: [String]
});

mongoose.model('posts', postSchema);