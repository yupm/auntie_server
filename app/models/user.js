// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
const { Schema } = mongoose;

// define the schema for our user model
var userSchema = mongoose.Schema({
    displayName: String,
    type: String,
    billing: String,
    firstName: String,
    lastName: String,
    contactEmail: String,
    company: { type: Schema.Types.ObjectId, ref: 'company'},
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
