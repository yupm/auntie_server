// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    username: String,
    type: String,
    companyProfile:{
        cname: String,
        description: String,
        processingTime: String,
        uen: String,
        city: String,
        postalCode: String,
        geometry: { type: { type: String, default:'Point' }, coordinates: [Number] },
        website: String,
        tel: String,
        companySize: Number,
        photos: [String],
        select: false
    },
    local            : {
        email        : String,
        password     : String,
        select: false
    },
    facebook         : {
        id           : String,
        token        : String,
        name         : String,
        email        : String,
        select: false
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String,
        select: false
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String,
        select: false
    }

});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('user', userSchema);
