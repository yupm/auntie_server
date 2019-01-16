const mongoose = require('mongoose');
const { Schema } = mongoose;

var itemSchema = new Schema({
    title: String,
    owner: { type: Schema.Types.ObjectId, ref: 'user'},
    description: String,
    url: String,
    views: { type: Number, default : 0 },
    searched: { type: Number, default : 0 },    
    filenames: [String],
    coverPic: {type: Number, default: 0},
    tags: [String],
    geometry: { type: { type: String, default:'Point' }, coordinates: [Number] }
});

mongoose.model('item', itemSchema);