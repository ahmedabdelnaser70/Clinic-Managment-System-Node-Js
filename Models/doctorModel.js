const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);
const addressSchema = require("./address.js");

const schema = mongoose.Schema({
    _id: {
        type: Number
    },
    firstName: {
        type: String,
        required: [true, 'Add the doctor\'s first name'],
        trim: true,
        maxLength: [50, 'first name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Add the doctor\'s last name'],
        trim: true,
        maxLength: [50, 'last name cannot exceed 50 characters']
    },
    age: {
        type: Number,
        min: [25, 'doctor\'s age must be > 25'],
        max: [60, 'doctor\'s age must be < 60']
    },
    specialty:{
        type: String,
        required: [true, 'doctor specialization is required']
    },
    address: {
        type: addressSchema.addressSchema,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    phone: {
        type: String,
        unique: [true, 'Repeated Mobile Phone'],
        match: [/^01[0125][0-9]{8}$/, 'Enter valid phone number']
    },
    clinic: {
        type: Array,
        required: true,
        ref: 'clinics'
    }
})

schema.plugin(AutoIncrement, {inc_field: '_id', start_seq: 1, id: 'Doctor_Id'});
mongoose.model('doctors', schema);
