const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('../Models/usersModel');
const UserSchema = mongoose.model('users');

exports.login = (request, response, next) => {
    if(request.body.email == process.env.admin_email && request.body.password == process.env.admin_password) {
        let token = jwt.sign({role: "admin"}, process.env.SECRET_KEY, {expiresIn: "5h"});
        let newResponse = {
            email: "admin@gmail.com",
            password: "123456",
            role: "admin",
            token: token
        };
        response.status(200).json(newResponse);
    }
    else {
        UserSchema.findOne({email: request.body.email}, {_id: 0, __v: 0}).then(function(data) {
            if(data != null) {
                if (bcrypt.compareSync(request.body.password, data.password)) {
                    let token = jwt.sign({role: data.role, id: data.userId}, process.env.SECRET_KEY, {expiresIn: "1h"});
                    let newResponse = {data};
                    newResponse.token = token;
                    response.status(200).json(newResponse);
                }
                else {
                    let error = new Error("Your email or password is incorrect");
                    error.status = 401
                    next(error);
                }
            }
            else {
                let error = new Error("Your email or password is incorrect");
                error.status = 401
                next(error);
            }
        })
    }
}