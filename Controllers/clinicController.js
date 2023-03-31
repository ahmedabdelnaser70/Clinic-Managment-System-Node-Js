const mongoose = require ("mongoose");
const helper = require("../helper/helperFunctions");
require("./../Models/clinicModel");
const ClinicSchema = mongoose.model("clinics");
require("./../Models/doctorModel");
const DoctorSchema = mongoose.model("doctors");
require("./../Models/employeeModel");
const EmployeeSchema = mongoose.model("employees");

exports.getAllClinic = function(request, response, next) {
	let sortAndFiltering = helper.sortAndFiltering(request);
	if(request.query.select && request.query.select.split(',').indexOf("doctors") == -1) {
		sortAndFiltering.selectedFields.doctors = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("manager") == -1) {
		sortAndFiltering.selectedFields.manager = 0;
	}
	ClinicSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
	.populate([
		{
			path: "doctors",
			populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
			select: {firstName:1, lastName: 1, specialty: 1, _id: 0}
		},
		{
			path: "manager",
			select: {firstName:1, lastName: 1, specialty: 1 }
		}
	]).sort(sortAndFiltering.sortedFields)
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
			ResponseObject.Message = 'No clinics are found';
		}
		response.status(200).json(ResponseObject);
	}).catch(function(error) {
		next(error);
	})
}

exports.getClinicById = function(request, response, next) {
	let sortAndFiltering = helper.sortAndFiltering(request);
	if(request.query.select && request.query.select.split(',').indexOf("doctors") == -1) {
		sortAndFiltering.selectedFields.doctors = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("manager") == -1) {
		sortAndFiltering.selectedFields.manager = 0;
	}
	ClinicSchema.find({_id: request.params.id}, sortAndFiltering.selectedFields)
	.populate([
		{
			path: "doctors",
			populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
			select: {firstName:1, lastName: 1, specialty: 1, _id: 0}
		},
		{
			path: "manager",
			select: {firstName:1, lastName: 1, specialty: 1 }
		}
	]).then((result) => {
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
			ResponseObject.Message = 'This clinic is not found';
		}
		response.status(200).json(ResponseObject);
	})
	.catch((error) => {
		next(error);
	});
}

exports.addClinic = function(request, response, next) {
	let ResponseObject = {
		Success: true,
		Data: [],
		Message: "The Clinics is added succesfully",
		TotalPages: 1
	}
	if(request.body.doctors != undefined) {
		let unique = [...request.body.doctors]
		if(request.body.manager != undefined) {
			unique.push(request.body.manager)
			unique = Array.from(new Set([...unique]))
		}
		DoctorSchema.find({_id: {$in: unique}}).then(function(data) {
			if(data.length == unique.length) {
				let newClinic = new ClinicSchema({
					location: request.body.location,
					mobilePhone: request.body.mobilePhone,
					doctors: unique,
					manager: request.body.manager,
					availability: true
				})
				newClinic.save()
				.then(function(result) {
					result.populate([
						{
							path: "doctors",
							populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
							select: {firstName:1, lastName: 1, specialty: 1, _id: 0}
						},
						{
							path: "manager",
							select: {firstName:1, lastName: 1, specialty: 1 }
						}
					]).then(function() {
						DoctorSchema.updateMany({_id: {$in: unique}}, {$push: {clinic: result._id}}).then(function(res) {
							ResponseObject.Data = [result];
							ResponseObject.Message = "The clinic is added successfully";
							response.status(201).json(ResponseObject);
						}).catch(function(error) {
							next(error);
						})
					})
				}).catch(function(error) {
					next(error);
				})
			}
			else {
				ResponseObject.Success = false;
				ResponseObject.Message = "One of the doctors that you try to add doesn't found";
				response.status(201).json(ResponseObject);		
			}
		})
	}
	else 
	{
		if(request.body.manager != undefined) {
			DoctorSchema.findOne({_id: request.body.manager}, {_id: 1}).then(function(result) {
				if(result != null) {
					let newClinic = new ClinicSchema({
						location: request.body.location,
						mobilePhone: request.body.mobilePhone,
						manager: request.body.manager,
						availability: true
					})
					newClinic.save().then(function(result) {
						ResponseObject.Data = [result];
						ResponseObject.Message = "The clinic is added successfully";
					}).catch(function(error) {
						next(error);
					})
				}
				else {
					ResponseObject.Success = false;
					ResponseObject.Message = "The manager that you try to add doesn't found";
				}
				response.status(201).json(ResponseObject);
			})
		}
		else {
			let newClinic = new ClinicSchema({
				location: request.body.location,
				mobilePhone: request.body.mobilePhone,
				availability: true
			})
			newClinic.save().then(function(result) {
				ResponseObject.Data = [result];
				ResponseObject.Message = "The clinic is added successfully";
				response.status(201).json(ResponseObject);
			}).catch(function(error) {
				next(error.Message);
			})
		}
	}
}

exports.updateClinicByManager = function(request, response, next) {
	let nameProperty = ["location", "mobilePhone", "doctors"]
	updateClinic(nameProperty, request, response, next);
}

exports.updateClinicByAdmin = function(request, response, next) {
	let nameProperty = ["location", "mobilePhone", "doctors", "manager", "availability"]
	updateClinic(nameProperty, request, response, next);
}

exports.deleteClinic = function(request, response, next) {
	let ResponseObject = {
		Success: true,
	}
	ClinicSchema.deleteOne({_id: request.params.id}).then(function(result) {
		DoctorSchema.updateMany({}, {$pull: {clinic: +(request.params.id)}}, {multi: true}).then(function() {
			if(result.acknowledged && result.deletedCount == 1) {
				EmployeeSchema.deleteMany({clinic: request.params.id}).then(function() {
					ResponseObject.Message = "This clinic is deleted successfully";
					response.status(200).json(ResponseObject);
				})
			}
			else {
				ResponseObject.Success = false
				ResponseObject.Message = "This clinic is not deleted";
				response.status(200).json(ResponseObject);
			}
		})
	}).catch(function(error) {
		next(error);
	})
}

function updateClinic(nameProperty, request, response, next) {
	let clinicData = {};
	let ResponseObject = {
		Success: true,
		Data: [],
		TotalPages: 1
	}
	for(let prop of nameProperty) {
		if(request.body[prop] != null) {
			clinicData[prop] = request.body[prop];
		}
	}
	ClinicSchema.findOne({_id: request.params.id}, {doctors: 1, _id: 0}).then(function(data) {
		if(data != null) {
			let oldDoctors = data.doctors;
			if(request.body.doctors != undefined) {
				let unique = Array.from(new Set([...request.body.doctors]))
				DoctorSchema.find({_id: {$in: unique}}).then(function(data) {
					if(data.length == unique.length) {
						ClinicSchema.updateOne({_id: request.params.id}, {$set: clinicData}).then(function(result) {
							if(result.modifiedCount == 0) {
								ResponseObject.Message = "Nothing is changed";
								response.status(201).json(ResponseObject);
							}
							else {
								if(unique.length > oldDoctors.length) { // add
									let newDoctor = unique.filter(function(e) {
										return oldDoctors.indexOf(e) == -1;
									})
									DoctorSchema.updateMany({_id: {$in: newDoctor}}, {$push: {clinic: +(request.params.id)}}).then(function() {
										ResponseObject.Message = "This clinic is updated succesfully";
										response.status(201).json(ResponseObject);
									})
									
								}
								else if(unique.length < oldDoctors.length) { // delete
									let deletedDoctor = oldDoctors.filter(function(e) {
										return unique.indexOf(e) == -1;
									})
									DoctorSchema.updateMany({_id: {$in: deletedDoctor}}, {$pull: {clinic: +(request.params.id)}}, {multi: true}).then(function() {
										ResponseObject.Message = "This clinic is updated succesfully";
										response.status(201).json(ResponseObject);
									})
								}
								else { // add & delete
									let newDoctor = unique.filter(function(e) {
										return oldDoctors.indexOf(e) == -1;
									})
									let deletedDoctor = oldDoctors.filter(function(e) {
										return unique.indexOf(e) == -1;
									})
									DoctorSchema.updateMany({_id: {$in: newDoctor}}, {$push: {clinic: +(request.params.id)}}).then(function() {
										DoctorSchema.updateMany({_id: {$in: deletedDoctor}}, {$pull: {clinic: +(request.params.id)}}, {multi: true}).then(function() {
											ResponseObject.Message = "This clinic is updated succesfully";
											response.status(201).json(ResponseObject);
										})
									})
								}
							}
							
						}).catch(function(error) {
							next(error);
						})
					}
					else {
						let error = new Error(`You cannot add doctor doesn't found`);
						error.status = 201;
						next(error)			
					}
				})
			}
			else {
				if(request.body.manager != undefined) {
					DoctorSchema.findOne({_id: request.body.manager}, {_id: 1}).then(function(result) {
						if(result != null) {
							ClinicSchema.updateOne({_id: request.params.id}, {$set: clinicData})
							.then(function(result) {
								if(result.modifiedCount == 0) {
									ResponseObject.Message = "Nothing is changed";
									response.status(201).json(ResponseObject);
								}
								else {
									ResponseObject.Message =  "This clinic is updated successfully";
									response.status(201).json(ResponseObject);
								}
							}).catch(function(error) {
								next(error);
							})
						}
						else {
							next(new Error("This manager is not found"))
						}
					})
				}
				else {
					ClinicSchema.updateOne({_id: request.params.id}, {$set: clinicData})
					.then(function(result) {
						if(result.modifiedCount == 0) {
							ResponseObject.Message = "Nothing is changed";
							response.status(201).json(ResponseObject);
						}
						else {
							ResponseObject.Message = "This clinic is updated successfully";
							response.status(201).json(ResponseObject);
						}
					}).catch(function(error) {
						next(error);
					})
				}
			}
		}
		else {
			let error = new Error('This clinic not found');
			error.status = 404;
			next(error);
		}
	}).catch(function(error) {
		next(error);
	})
}