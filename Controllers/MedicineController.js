const mongoose = require("mongoose");
const helper = require("../helper/helperFunctions");
require("../Models/MedicineModel")
const medicineSchema = mongoose.model("medicines")

exports.getAllMedicines = (request, response, next) => {
	let sortAndFiltering = helper.sortAndFiltering(request);
	medicineSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
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
			ResponseObject.Message = 'No Medicines are found';
		}
		response.status(200).json(ResponseObject);
	}).catch(function(error) {
		next(error);
	})
}

exports.getMedicineById = (request, response, next) => {
	let sortAndFiltering = helper.sortAndFiltering(request);
	medicineSchema.find({_id: request.params.id}, sortAndFiltering.selectedFields)
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
			ResponseObject.Message = 'No Medicines are found';
		}
		response.status(200).json(ResponseObject);
	}).catch(function(error) {
		next(error);
	})
}

exports.addMedicine = (request, response, next) => {
	let medicineObject = new medicineSchema({
		name: request.body.name[0].toUpperCase() + request.body.name.slice(1).toLowerCase(),
		description: request.body.description
	})
	medicineObject.save()
	.then(result => {
		let ResponseObject = {
			Success: true,
			Data: [result],
			Message: "The Medicine is added succesfully",
			TotalPages: 1
		}
		response.status(201).json(ResponseObject);
	})
	.catch( error=>next(error) ) 


}

exports.updateMedicineById = (request, response, next) => {
	let ResponseObject = {
		Success: true,
	}
	let propertyName = {};
	if(request.body.name != undefined) {
		propertyName.name = request.body.name[0].toUpperCase() + request.body.name.slice(1).toLowerCase()
	}
	if(request.body.description != undefined) {
		propertyName.description = request.body.description
	}
	if(Object.keys(propertyName).length == 0) {
		ResponseObject.Message = "Nothing is changed";
		response.status(201).json(ResponseObject);
	}
	else {
		medicineSchema.updateOne({_id:request.params.id}, {$set: propertyName})
		.then(result => {
			if(result.modifiedCount == 0) {
				ResponseObject.Message = "Nothing is changed";
			}
			else {
				ResponseObject.Message = "The medicine is updated succesfully";
			}
			response.status(201).json(ResponseObject);
		})
		.catch(error=>next(error) ) 
	}
}

exports.deleteMedicineById = (request, response, next) => {
	let ResponseObject = {
		Success: true,
	}
	medicineSchema.deleteOne({_id: request.params.id})
	.then((result) => {
		if(result.acknowledged && result.deletedCount == 1) {
			ResponseObject.Message = "Nothing is changed";
		}
		else {
			ResponseObject.Message = "The medicine is deleted succesfully";
		}
		response.status(201).json(ResponseObject);		
	})
	.catch((error) =>
	{
		next(error)
	})
};