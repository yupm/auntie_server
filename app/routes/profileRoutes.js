const mongoose = require('mongoose');
const User = mongoose.model('user');
const logger = require('../../config/logger')(__filename);


module.exports = function(app) {

   // PROFILE SECTION =========================
   app.get('/profile', isLoggedIn, async(req, res) => {
        const profile = await req.user.populate('company');
        res.render('profile.ejs', {
            user : profile
        });
    });

    app.post('/profile', isLoggedIn, async(req, res) => {
        const profile = await req.user.populate('company');

        profile.displayName = req.body.displayname;
        profile.firstName = req.body.firstname;
        profile.lastName = req.body.lastname;
        profile.contactEmail= req.body.contactEmail;
        profile.company.name= req.body.cname;
        profile.company.website= req.body.website;
        profile.company.description= req.body.description;

        profile.save().then((updatedProfile)=>{
            profile.company.save().then(()=>{
                res.render('profile.ejs', {
                    user : updatedProfile
                });

            });
        });
        /*
        User.update({id: req.user.id}, {
            displayName: req.body.displayName,
            firstName: req.body.firstname,
            lastname: req.body.lastname,
            contactEmail: req.body.contactEmail,
            company.website: req.body.website,

        }, function(err){
            if(err){console.log(err);} 


        });*/


    });


   // SETTINGS SECTION =========================
   app.get('/settings', isLoggedIn, async(req, res) => {
        res.render('settings.ejs', {
            user: req.user,
            message: req.flash('passwordMsg') 
        });
    });

    app.post('/settings', isLoggedIn, async(req, res) => {
        console.log("Update");

        if (req.user.validPassword(req.body.oldpw))
        {
            console.log("YES");
            req.user.local.password = req.user.generateHash(req.body.pw);
            req.user.save().then(()=>{
                req.flash('passwordMsg', 'Password successfully updated!');
                res.redirect('/settings');
            });
        }else{
            console.log("No");
            req.flash('passwordMsg', 'Your current password is incorrect.');
            res.redirect('/settings');
        }


    });

}


// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    //if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
