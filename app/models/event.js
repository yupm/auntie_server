const mongoose = require('mongoose');
const { Schema } = mongoose;

var eventSchema = new Schema({
    title: String,
    company: String,
    from: Date,
    to: Date,
    description: String,
    venue: String,
    geometry: { type: { type: String, default:'Point' }, coordinates: [Number] },
    filename: String,
    url: String,
    outboundURL: String,
    poster: { type: Schema.Types.ObjectId, ref: 'user'},
    anon: {
        name: String,
        email: String
    }

});

eventSchema.index( { "geometry" : "2dsphere" } );

mongoose.model('events', eventSchema);