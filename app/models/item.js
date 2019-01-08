const mongoose = require('mongoose');
const { Schema } = mongoose;

var itemSchema = new Schema({
    title: String,
    owner: { type: Schema.Types.ObjectId, ref: 'user'},
    description: String,
    filename: String,
    tags: [String],
    geometry: { type: { type: String, default:'Point' }, coordinates: [Number] }
});

mongoose.model('item', itemSchema);