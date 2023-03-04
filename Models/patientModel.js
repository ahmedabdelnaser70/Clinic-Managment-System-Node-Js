const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const addressSchema = require("./address");

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
      required: [true, "Add the patient first Name"] 
   },
   lastName: { 
      type: String, 
      required: [true, "Add the patient last Name"] 
   },
   age: { 
      type: Number, 
      require: [true, "Add the patient Age"] 
   },
   address: {
      type: addressSchema.addressSchema
   },
   phone: { 
      type: String, 
      unique: true, 
      matches: [/^01[0125][0-9]{8}$/, "Enter valid phone number"] 
   },
   image: {
      type: String,
   },
});

schema.plugin(AutoIncrement, {inc_field: "_id", start_seq: 1, id: "patient_id"});

mongoose.model("patients", schema);
