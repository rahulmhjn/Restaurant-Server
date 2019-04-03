var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

const dishesSchema = new Schema({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }
}, {
    timestamps: true
});

const favouriteSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    dishes : [dishesSchema]
    
},{
    timestamps: true
});

var Favourites = mongoose.model('Favourite',favouriteSchema);

module.exports = Favourites;