const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const helper = require("../helper/helperFunctions");
const { request, response } = require("express");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
require("../Models/usersModel");
const UserSchema = mongoose.model("users");

exports.getEmail = function(request, response, next) {
	let sortAndFiltering = helper.sortAndFiltering(request);
	sortAndFiltering.selectedFields.password = 0
	UserSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
	.then(function(result) {
		let ResponseObject = {
			Success: true,
			Data: result,
			// PageNo: request.length,
			// ItemsNoPerPages: Number,
			TotalPages: result.length
		}
		if (result.length > 0) {
			ResponseObject.Message = 'Your request is success';
		} 
		else {
			ResponseObject.Success = false;
			ResponseObject.Message = 'This email is not found';
		}
		response.status(200).json(ResponseObject);
	}).catch(function(error) {
		next(error);
	})
}

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