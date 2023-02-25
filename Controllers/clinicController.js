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
	ClinicSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
	.populate([
		{
			path: "doctors",
			select: {firstName:1, lastName: 1, specialty: 1, _id: 0}
		},
		{
			path: "manager",
			select: {firstName:1, lastName: 1, specialty: 1 }
		}
	]).sort(sortAndFiltering.sortedFields)
	.then(function(result) {
		if(result.length > 0) {
			response.status(200).json(result);
		}
		else {
			let error = new Error("Empty");
			error.status = 403;
			next(error);
		}
	}).catch(function(error) {
		next(error);
	})
}

exports.getClinicById = function(request, response, next) {
	let sortAndFiltering = helper.sortAndFiltering(request);
	ClinicSchema.findOne({_id: request.params.id}, sortAndFiltering.selectedFields)
	.populate([
		{
			path: "doctors",
			select: {firstName:1, lastName: 1, specialty: 1, _id: 0}
		},
		{
			path: "manager",
			select: {firstName:1, lastName: 1, specialty: 1 }
		}
	]).then((data) => {
		if (data) {
			response.status(201).json(data);
		} else {
			next(new Error("This clinic does not exist"));
		}
	})
	.catch((error) => {
		next(error);
	});
}

exports.addClinic = function(request, response, next) {
	if(request.body.doctors != undefined) {
		let unique = Array.from(new Set([...request.body.doctors]))
		if(request.body.manager != undefined) {
			unique.push(request.body.manager)
		}
		DoctorSchema.find({_id: {$in: unique}}).then(function(data) {
			if(data.length == unique.length) {
				let newClinic = new ClinicSchema({
					location: request.body.location,
					mobilePhone: request.body.mobilePhone,
					doctors: unique,
					manager: request.body.manager
				})
				newClinic.save().then(function(result) {
					DoctorSchema.updateMany({_id: {$in: unique}}, {$push: {clinic: result._id}}).then(function(res) {
						response.status(201).json(result);
					}).catch(function(error) {
						console.log(error);
					})
				}).catch(function(error) {
					next(error);
				})
			}
			else {
				next(new Error(`You cannot add doctor doesn't found`))			
			}
		})
	}
	else {
		if(request.body.manager != undefined) {
			DoctorSchema.findOne({_id: request.body.manager}, {_id: 1}).then(function(result) {
				if(result != null) {
					let newClinic = new ClinicSchema({
						location: request.body.location,
						mobilePhone: request.body.mobilePhone,
						manager: request.body.manager
					})
					newClinic.save().then(function(result) {
						response.status(201).json(result);
					}).catch(function(error) {
						next(error);
					})
				}
				else {
					next(new Error('This manager is not found'))
				}
			})
		}
		else {
			let newClinic = new ClinicSchema({
				location: request.body.location,
				mobilePhone: request.body.mobilePhone,
	
			})
			newClinic.save().then(function(result) {
				response.status(201).json(result);
			}).catch(function(error) {
				next(error);
			})
		}
	}
}

exports.updateClinic = function(request, response, next) {
	let nameProperty = ["location", "mobilePhone", "doctors"]
	let clinicData = {};
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
								response.status(200).json({Updated: true, Message: "Nothing is changed"});
							}
							else {
								if(unique.length > oldDoctors.length) { // add
									let newDoctor = unique.filter(function(e) {
										return oldDoctors.indexOf(e) == -1;
									})
									DoctorSchema.updateMany({_id: {$in: newDoctor}}, {$push: {clinic: +(request.params.id)}}).then(function() {
										response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
									})
									
								}
								else if(unique.length < oldDoctors.length) { // delete
									let deletedDoctor = oldDoctors.filter(function(e) {
										return unique.indexOf(e) == -1;
									})
									DoctorSchema.updateMany({_id: {$in: deletedDoctor}}, {$pull: {clinic: +(request.params.id)}}, {multi: true}).then(function() {
										response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
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
											response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
										})
									})
								}
							}
							
						}).catch(function(error) {
							next(error);
						})
					}
					else {
						next(new Error(`You cannot add doctor doesn't found`))			
					}
				})
			}
			else {
				if(request.body.manager != undefined) {
					DoctorSchema.findOne({_id: request.body.manager}, {_id: 1}).then(function(result) {
						if(result != null) {
							ClinicSchema.updateOne(
								{
									_id: request.params.id,
								},
								{ 
									$set: {
										location: request.body.location,
										mobilePhone: request.body.mobilePhone,
										manager: request.body.manager
									}
								}
							).then(function(result) {
								if(result.modifiedCount == 0) {
									response.status(200).json({Updated: true, Message: "Nothing is changed"});
								}
								else {
									response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
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
					ClinicSchema.updateOne(
						{
							_id: request.params.id,
						},
						{ 
							$set: {
								name: request.body.name,
								location: request.body.location,
								mobilePhone: request.body.mobilePhone,
							}
						}
					).then(function(result) {
						if(result.modifiedCount == 0) {
							response.status(200).json({Updated: true, Message: "Nothing is changed"});
						}
						else {
							response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
						}
					}).catch(function(error) {
						next(error);
					})
				}
			}
		}
		else {
			next(new Error('This clinic not found'));
		}
	}).catch(function(error) {
		next(error);
	})
}

exports.updateClinicManager = function(request, response, next) {
	DoctorSchema.findOne({_id: request.body.manager}).then(function(data) {
		if(data.length > 0) {
			ClinicSchema.updateOne({_id: request.params.id}, {$set: {manager: request.body.manager}}).then(function(result) {
				if(result.modifiedCount == 0) {
					response.status(200).json({Updated: true, Message: "Nothing is changed"});
				}
				else {
					response.status(200).json({Updated: true, Message: "This clinic is updated successfully"});
				}
				
			}).catch(function(error) {
				next(error);
			})
		}
		else {
			next(new Error(`You cannot add doctor doesn't found`))			
		}
	}).catch(function(error) {
		next(error);
	})
}

exports.deleteClinic = function(request, response, next) {
	ClinicSchema.deleteOne({_id: request.params.id}).then(function(result) {
		DoctorSchema.updateMany({}, {$pull: {clinic: +(request.params.id)}}, {multi: true}).then(function() {
			if(result.acknowledged && result.deletedCount == 1) {
				EmployeeSchema.deleteMany({clinic: request.params.id}).then(function() {
					response.status(200).json({Deleted: true, Message: "This clinic is deleted successfully"});
				})
			}
			else {
				response.status(200).json({Deleted: false, Message: "This clinic is not deleted"});
			}
		})
	}).catch(function(error) {
		next(error);
	})
}