const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const addressSchema = require("./address.js");

const schema = new mongoose.Schema({
   _id: { 
      type: Number 
   },
   SSN: {
      type: Number, 
      unique: true, 
      required: true, 
      match: [/[0-9]{14}/, "Invalid SSN"]
   },
   firstName: { 
      type: String, 
      required: true 
   },
   lastName: { 
      type: String, 
      required: true 
   },
   age: { 
      type: Number, 
      required: true 
   },
   address: {
      type: addressSchema.addressSchema,
      required: true
   },
   phone: { 
      type: String, 
      required: true, 
      unique: [true, "Repeated Mobile Phone"], 
      match: [/^01[0125][0-9]{8}$/, "Enter valid phone number"] 
   },
   job: {
      type: String,
      required: true
   },
   salary: {
      type: Number,
      required: true
   },
   image: { 
      type: String 
   },
   clinic: {
      type: Number,
      ref: "clinics",
      required: true
   },
   availability: {
		type: Boolean,
		required: true
	}
});

schema.plugin(AutoIncrement, { inc_field: "_id", start_seq: 1, id: 'Employee_Id'});
mongoose.model("employees", schema);
