const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favourites = require('../models/favourite');

const authenticate = require('../authenticate');
const cors = require('./cors');

const favouriteRouter = express.Router();
favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions,(req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favourites.find({"user": req.user._id})
    .populate('user')
    .populate('dishes.dish')
    .then((favourites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(favourites)
    },(err) => {next(err)})
    .catch((err) => {next(err)});
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    Favourites.findOne({user: req.user._id})
     .then((favorite) => {
        if (favorite) {
            for (var i=0; i<req.body.length; i++) {
                if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                    favorite.dishes.push(req.body[i]._id);
                }
            }
            favorite.save()
            .then((favorite) => {
                console.log('asdasdasdFavorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err)); 
        }
        else {
            Favourites.create({"user": req.user._id, "dishes": req.body})
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    })
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.findOneAndDelete({"user": req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));   
});


favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res, next) => {
    Favourites.find({user: req.user._id})
    .then((fav) => {
        console.log(fav);
        if (fav.length > 0) {
            fav[0].dishes.push({dish: req.params.dishId});
            fav[0].save()
            .then((fav) => {
                Favourites.findById(fav._id)
                .populate('dishes.dish')
                .populate('user')
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
                })
            })
        }
        else {
            console.log('user does not exist');
            req.body.user = req.user._id;
            req.body.dishes = {dish :req.params.dishId};
            console.log("We will insert: ",req.body.dishes);
            Favourites.create(req.body)
            .then((fav) => {
                Favourites.findById(fav._id)
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
                })
            })
        }
    })
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favourites.find({user: req.user._id})
    .then((fav) => {
        console.log('sa'+fav);
        Favourites.find({'dishes': {$elemMatch: {dish: req.params.dish}}})   // $elemMatch matches with all the strings given in condition
    .then((fav) => {
        console.log(fav);
        if (fav) {
            for (var i = (fav.dishes.length - 1); i >= 0 ; i--){
                if(fav.dishes.id(fav.dishes[i]._id).dish == req.params.dishId){
                    console.log("Found dish to remove")
                    fav.dishes.id(fav.dishes[i]._id).remove();
                }
                
            }
            fav.save()
            .then((fav) => {
                Favourites.findById(fav._id)
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
                })
            }, (err) => {return next(err);})
        }
        else {
            console.log('The dish is not in your favourites');
            var err = new Error('The dish is not in your favourites')
            err.status = 403;
            return next(err);
        }
    },(err) => {return next(err);})
    .catch((err) => {return next(err);})
    })
    
});

module.exports = favouriteRouter;