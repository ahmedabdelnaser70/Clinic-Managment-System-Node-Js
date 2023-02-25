const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
require("../Models/usersModel");
const UserSchema = mongoose.model("users");

exports.updateEmail = (request, response, next) => {
	const hash = bcrypt.hashSync(request.body.password, salt);
	UserSchema.findOne({userId: request.id}).then(function(data) {
		if(data) {
			if (bcrypt.compareSync(request.body.password, data.password)) {
				UserSchema.updateOne({userId: request.id}, {
					$set: {
						email: request.body.email
					}
				}).then(function(result) {
					response.status(201).json({Updated: true, Message: "Your email is updated successfully"})
				})
			}
			else {
				next(new Error("Your password may incorrect"))
			}
		}
		else {
			next(new Error("Not Authorized"))
		}
	})
};

exports.updatePassword = (request, response, next) => {
	const newHash = bcrypt.hashSync(request.body.newPassword, salt);
	UserSchema.findOne({userId: request.id}).then(function(data) {
		if(data) {
			if (bcrypt.compareSync(request.body.oldPassword, data.password)) {
				UserSchema.updateOne({userId: request.id}, {
					$set: {
						password: newHash
					}
				}).then(function(result) {
					response.status(201).json({Updated: true, Message: "Your email is updated successfully"})
				})
			}
			else {
				next(new Error("Your password may incorrect"))
			}
		}
		else {
			next(new Error("Not Authorized"))
		}
	})
};