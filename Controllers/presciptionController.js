const mongoose = require("mongoose");
const helper = require("../helper/helperFunctions");
require("./../Models/prescriptionModel");
const PresciptionsSchema = mongoose.model("presciptions");
require("./../Models/clinicModel");
const ClinicSchema = mongoose.model("clinics");
require("./../Models/patientModel");
const PatientSchema = mongoose.model("patients");
require("./../Models/MedicineModel");
const MedicineSchema = mongoose.model("medicines");

exports.getAllPresciptions = function (request, response, next) {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("doctor") == -1) {
		sortAndFiltering.selectedFields.doctor = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
   PresciptionsSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
      .populate([
         {
            path: "clinic",
            select: { location: 1, _id: 0 },
         },
         {
            path: "doctor",
            populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
            select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
         },
         {
            path: "patient",
            select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
         },
         {
            path: "medicine.medicineId",
            select: { name: 1, _id: 0 },
         },
      ])
      .sort(sortAndFiltering.sortedFields)
      .then(function (result) {
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
            ResponseObject.Message = 'No prescriptions are found';
         }
         response.status(200).json(ResponseObject);
      })
      .catch(function (error) {
         next(error);
      });
};

exports.getPresciptionById = function (request, response, next) {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("doctor") == -1) {
		sortAndFiltering.selectedFields.doctor = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
   PresciptionsSchema.find(
      {
         _id: request.params.id,
      },
      sortAndFiltering.selectedFields
   )
   .populate([
      {
         path: "clinic",
         select: { location: 1, _id: 0 },
      },
      {
         path: "doctor",
         populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
         select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
      },
      {
         path: "patient",
         select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
      },
      {
         path: "medicine.medicineId",
         select: { name: 1, _id: 0 },
      },
   ])
   .sort(sortAndFiltering.sortedFields)
   .then(function (result) {
      let ResponseObject = {
         Success: true,
         Data: result,
         // PageNo: request.length,
         // ItemsNoPerPages: Number,
         TotalPages: result.length
      }
      if(request.role == "admin" || result[0].doctor.id == request.id) {
         if (result.length > 0) {
            ResponseObject.Message = 'Your request is success';
         } 
         else {
            ResponseObject.Success = false;
            ResponseObject.Message = 'This prescription is not found';
         }
      }
      else {
         ResponseObject.Success = false;
         ResponseObject.Message = 'Not allow to show the details of this prescription';
      }
      response.status(200).json(ResponseObject);
   })
   .catch(function (error) {
      next(error);
   });
};

exports.getPresciptionsByClinicId = function (request, response, next) {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("doctor") == -1) {
		sortAndFiltering.selectedFields.doctor = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
   PresciptionsSchema.find({ clinic: request.params.id }, sortAndFiltering.selectedFields)
   .populate([
      {
         path: "clinic",
         select: { location: 1, _id: 0 },
      },
      {
         path: "doctor",
         populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
         select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
      },
      {
         path: "patient",
         select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
      },
      {
         path: "medicine.medicineId",
         select: { name: 1, _id: 0 },
      },
   ])
      .sort(sortAndFiltering.sortedFields)
      .then(function (result) {
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
               ResponseObject.Message = 'No prescriptions are found for this clinic';
            }
            response.status(200).json(ResponseObject);
      })
      .catch(function (error) {
         next(error);
      });
};

exports.getPresciptionsByDoctorId = function (request, response, next) {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("doctor") == -1) {
		sortAndFiltering.selectedFields.doctor = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
   PresciptionsSchema.find({ doctor: request.params.id }, sortAndFiltering.selectedFields)
   .populate([
      {
         path: "clinic",
         select: { location: 1, _id: 0 },
      },
      {
         path: "doctor",
         populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
         select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
      },
      {
         path: "patient",
         select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
      },
      {
         path: "medicine.medicineId",
         select: { name: 1, _id: 0 },
      },
   ])
      .sort(sortAndFiltering.sortedFields)
      .then(function (result) {
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
            ResponseObject.Message = 'No prescriptions are found for this doctor';
         }
         response.status(200).json(ResponseObject);
      })
      .catch(function (error) {
         next(error);
      });
};

exports.getPresciptionsByPatientId = function (request, response, next) {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("doctor") == -1) {
		sortAndFiltering.selectedFields.doctor = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("medicine") == -1) {
		sortAndFiltering.selectedFields.medicine = 0;
	}
   PresciptionsSchema.find({ patient: request.params.id }, sortAndFiltering.selectedFields)
   .populate([
      {
         path: "clinic",
         select: { location: 1, _id: 0 },
      },
      {
         path: "doctor",
         populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
         select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
      },
      {
         path: "patient",
         select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
      },
      {
         path: "medicine.medicineId",
         select: { name: 1, _id: 0 },
      },
   ])
      .sort(sortAndFiltering.sortedFields)
      .then(function (result) {
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
            ResponseObject.Message = 'No prescriptions are found for this patient';
         }
         response.status(200).json(ResponseObject);
      })
      .catch(function (error) {
         next(error);
      });
};

exports.addPresciption = function (request, response, next) {
   let ResponseObject = {
      Success: true,
      Data: [],
      Message: "The prescription is added successfully",
      TotalPages: 1
   }
   if (request.body.medicine != undefined) {
      let tempArray = [];
      request.body.medicine.forEach(function (medicine) {
         tempArray.push(medicine.medicineId);
      });
      let uniqueMedicines = Array.from(new Set(tempArray));
      if (request.body.medicine.length == uniqueMedicines.length) {
         MedicineSchema.find({ _id: { $in: uniqueMedicines } }).then(function (result) {
            if (result.length == uniqueMedicines.length) {
               ClinicSchema.findOne({ _id: request.body.clinic }).then(function (clinicData) {
                  if (clinicData != null) {
                     PatientSchema.findOne({ _id: request.body.patient}).then(function (patientData) {
                        if (patientData != null) {
                           let presciptionDate = new Date();
                           let newPresciption = new PresciptionsSchema({
                              clinic: request.body.clinic,
                              doctor: request.body.doctor,
                              patient: request.id,
                              medicine: request.body.medicine,
                              notes: request.body.notes,
                              date: presciptionDate.toLocaleDateString(),
                              time: presciptionDate.toLocaleTimeString(),
                           });
                           newPresciption.save()
                           .then(function (result) {
                              result.populate([
                                 {
                                    path: "clinic",
                                    select: { location: 1, _id: 0 },
                                 },
                                 {
                                    path: "doctor",
                                    populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
                                    select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
                                 },
                                 {
                                    path: "patient",
                                    select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
                                 },
                                 {
                                    path: "medicine.medicineId",
                                    select: { name: 1, _id: 0 },
                                 },
                              ]).then(function() {
                                 console.log(result)
                                 ResponseObject.Data = [result];
                                 response.status(201).json(ResponseObject);
                              })
                           })
                           .catch(function (error) {
                              next(error);
                           });
                        } 
                        else {
                           ResponseObject.Success = false;
                           ResponseObject.Message = "You try to add patient not found";
                           response.status(201).json(ResponseObject);
                        }
                     });
                  } 
                  else {
                     ResponseObject.Success = false
                     ResponseObject.Message = "You try to add medicin not found";
                     response.status(404).json(ResponseObject);
                  }
               });
            } 
            else 
            {
               ResponseObject.Success = false;
               ResponseObject.Message = "You try to add medicin not found";
               response.status(404).json(ResponseObject);
            }
         });
      } 
      else {
         next(new Error("You can add any medicine only one time in each presciption"));
      }
   } 
   else {
      ClinicSchema.findOne({ _id: request.body.clinic }).then(function (clinicData) {
         if (clinicData != null) {
            PatientSchema.findOne({ _id: request.body.patient}).then(function (patientData) {
               if (patientData != null) {
                  let presciptionDate = new Date();
                  let newPresciption = new PresciptionsSchema({
                     clinic: request.body.clinic,
                     doctor: request.id,
                     patient: request.body.patient,
                     notes: request.body.notes,
                     date: presciptionDate.toLocaleDateString(),
                     time: presciptionDate.toLocaleTimeString(),
                  });
                  newPresciption.save()
                     .then(function (result) {
                        result.populate([
                           {
                              path: "clinic",
                              select: { location: 1, _id: 0 },
                           },
                           {
                              path: "doctor",
                              select: { firstName: 1, lastName: 1, specialty: 1, _id: 0 },
                           },
                           {
                              path: "patient",
                              select: { firstName: 1, lastName: 1, age: 1, _id: 0 },
                           },
                           {
                              path: "medicine.medicineId",
                              select: { name: 1, _id: 0 },
                           },
                        ]).then(function() {
                           ResponseObject.Data = [result];
                           response.status(201).json(ResponseObject);
                        })
                     })
                     .catch(function (error) {
                        next(error);
                     });
               } else {
                  next(new Error("You try to add patient not found"));
               }
            });
         } else {
            next(new Error("You try to add medicin not found"));
         }
      });
   }
};

exports.updatePresciption = function (request, response, next) {
   let ResponseObject = {
		Success: true,
      Message: "The prescription is updated successfully",
		TotalPages: 1
	}

   let changes = {};
   PresciptionsSchema.findOne({ _id: request.params.id })
   .then(function (data) {
      if(request.role == "admin" || request.id == data.doctor) {
         if (request.body.medicine != undefined) {
            let oldMedicine = [];
            data.medicine.forEach(function (medId) {
               oldMedicine.push(medId.medicineId);
            });
            let newMedicine = [];
            request.body.medicine.forEach(function (med) {
               newMedicine.push(med.medicineId);
            });
            let unique = Array.from(new Set([...newMedicine]));
            if (unique.length == newMedicine.length) {
               MedicineSchema.find({ _id: { $in: unique } })
               .then(function (medicineData) {
                  if (medicineData.length == unique.length) {
                     changes.medicine = request.body.medicine;
                     checkPatient(request, response, next, ResponseObject, changes);
                  } 
                  else {
                     ResponseObject.Success = false
                     ResponseObject.Message = "You cannot add medicine not found";
                     response.status(400).json(ResponseObject);
                  }
               })
               .catch(function (error) {
                  next(error);
               });
            } 
            else {
               ResponseObject.Success = false
               ResponseObject.Message = "You cannot add the same medicine 2 times";
               response.status(400).json(ResponseObject);
            }
         } 
         else {
            checkPatient(request, response, next, ResponseObject, changes)
         }
      }
      else {
         let error = new Error("Not allow for you to update the information of this prescription")
         error.status = 403
         next(error);
      }
   })
   .catch(function () {
      next(new Error("This presciption not found"));
   });
};

//Deletion allow only for doctor and admin
exports.deletePresciption = function (request, response, next) {
   let ResponseObject = {
		Success: true,
	}
   PresciptionsSchema.findById({_id: request.params.id}, {doctor: 1, _id: 0})
   .then(function(res) {
      if(res != null && (request.role == "admin" || res.doctor == request.id)) {         
         PresciptionsSchema.deleteOne({_id: request.params.id})
         .then(function (result) {
            if (result.acknowledged && result.deletedCount == 1) {
               ResponseObject.Message = "This Prescription is deleted successfully";
            } 
            else {
               ResponseObject.Message = "This Prescription is not found";
            }
            response.status(200).json(ResponseObject);
         })
         .catch(function (error) {
            next(error);
         });
      }
      else {
         if(res == null) {
            ResponseObject.Message = "This Prescription is not found";
         }
         else {
            ResponseObject.Message = 'Not allow to show the details of this prescription';
         }
         response.status(200).json(ResponseObject);
      }
   })
};

function checkPatient(request, response, next, ResponseObject, changes) {
   if(request.body.patient != undefined) {
      PatientSchema.findOne({ _id: request.body.patient }, { _id: 1 }).then(function (patientData) {
         if (patientData != null) {
            changes.patient = request.body.patient
            checkClinic(request, response, next, ResponseObject, changes);
         } 
         else {
            ResponseObject.Success = false;
            ResponseObject.Message = "This patient is not found";
            response.status(404).json(ResponseObject);
         }
      });
   }
   else {
      checkClinic(request, response, next, ResponseObject, changes);
   }
}

function checkClinic(request, response, next, ResponseObject, changes) {
   if(request.body.clinic != undefined) {
      ClinicSchema.findOne({ _id: request.body.clinic }, { _id: 1 })
      .then(function (ClinicData) {
         if (ClinicData != null) {
            changes.clinic = request.body.clinic
            PresciptionsSchema.updateOne({_id: request.params.id},{$set: changes})
            .then(function (result) {
               if(result.modifiedCount == 0) {
                  ResponseObject.Message = "Nothing is changed";
                  response.status(201).json(ResponseObject);
               }
               else {
                  ResponseObject.Message =  "Prescription is updated successfully";
                  response.status(201).json(ResponseObject);
               }
            })
            .catch(function (error) {
               next(error);
            });
         } 
         else {
            ResponseObject.Success = false;
            ResponseObject.Message = "This clinic is not found";
            response.status(404).json(ResponseObject);
         }
      })
      .catch(function (error) {
         next(error);
      });
   }
   else {
      PresciptionsSchema.updateOne({_id: request.params.id}, {$set: changes})
      .then(function (result) {
         if(result.modifiedCount == 0) {
            ResponseObject.Message = "Nothing is changed";
            response.status(201).json(ResponseObject);
         }
         else {
            ResponseObject.Message =  "Prescription is updated successfully";
            response.status(201).json(ResponseObject);
         }
      })
      .catch(function (error) {
         next(error);
      });
   }
}