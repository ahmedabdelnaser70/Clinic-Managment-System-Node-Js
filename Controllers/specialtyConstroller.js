const mongoose = require ("mongoose");
const helper = require("../helper/helperFunctions");
require("./../Models/specialtyModel");
const SpecialtySchema = mongoose.model("specialties");
require("./../Models/doctorModel");
const DoctorSchema = mongoose.model("doctors");

exports.getAllSpecialties = function(request, response, next) {
	let sortAndFiltering = helper.sortAndFiltering(request);
	SpecialtySchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
	.sort(sortAndFiltering.sortedFields)
	.then(function(result) {
		let ResponseObject = {
			Success: true,
			Data: result,
			// PageNo: request.length,
			// ItemsNoPerPages: Number,
			TotalPages: request.length
		}
		if(result.length > 0) {
			ResponseObject.Message = 'Your request is success';
		}
		else {
			ResponseObject.Success = false;
			ResponseObject.Message = 'No specialties are found';
		}
		response.status(200).json(ResponseObject);
	}).catch(function(error) {
		next(error);
	})
}

exports.getSpecialtyById = function(request, response, next) {
	let sortAndFiltering = helper.sortAndFiltering(request);
	SpecialtySchema.find({_id: request.params.id, availability: true}, sortAndFiltering.selectedFields)
	.then((result) => {
		let ResponseObject = {
			Success: true,
			Data: result,
			// PageNo: request.length,
			// ItemsNoPerPages: Number,
			TotalPages: request.length
		}
		if(result.length > 0) {
			ResponseObject.Message = 'Your request is success';
		}
		else {
			ResponseObject.Success = false;
			ResponseObject.Message = 'This specialty is not found';
		}
		response.status(200).json(ResponseObject);
	})
	.catch((error) => {
		next(error);
	});
}

exports.addSpecialty = function(request, response, next) {
	let newSpecialty = new SpecialtySchema({
		specialty: request.body.specialty,
		availability: request.body.availability
	})
	newSpecialty.save().then(function(result) {
		let ResponseObject = {
			Success: true,
			Data: [result],
			Message: "The spceialty is added succesfully",
			TotalPages: 1
		}
		response.status(201).json(ResponseObject);
	}).catch(function(error) {
		next(error);
	})
}

exports.updateSpecialtyName = function(request, response, next) {
	SpecialtySchema.updateMany({_id: request.params.id, availability: true}, {$set: {specialty: request.body.specialty}})
	.then(function(result) {
		let ResponseObject = {
			Success: true,
		}
		if(result.modifiedCount == 0) {
			ResponseObject.Message = "Nothing is changed";
		}
		else {
			ResponseObject.Message = "The spceialty is updated succesfully";
		}
		response.status(201).json(ResponseObject);
	}).catch(function(error) {
		next(error);
	})
}

//Block all doctor with this specialty
exports.deleteSpecialty = function(request, response, next) {
	SpecialtySchema.deleteOne({_id: request.params.id}).then(function(result) {
		let ResponseObject = {
			Success: true,
		}
		DoctorSchema.updateMany({specialty: request.params.id}, {$set: {status: false}})
		.then(function(data) {
			if(result.acknowledged && result.deletedCount == 1) {
				ResponseObject.Message = "Nothing is changed";
			}
			else {
				ResponseObject.Message = "The spceialty is deleted succesfully";
			}
			response.status(201).json(ResponseObject);
		}).catch(function(error) {
			next(error);
		})
	}).catch(function(error) {
		next(error);
	})
}