const mongoose = require('mongoose');
const { Schema } = mongoose;

var companySchema = new Schema({
    name: String,
    description: String,
    sector: String,
    owner: { type: Schema.Types.ObjectId, ref: 'user'},
    type: String,
    processingTime: String,
    uen: String,
    city: String,
    postalCode: String,
    geometry: { type: { type: String, default:'Point' }, coordinates: [Number] },
    website: String,
    tel: String,
    companySize: Number,
    photos: [String]
});

module.exports = mongoose.model('company', companySchema);