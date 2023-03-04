const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const schema = mongoose.Schema({
    _id: {
        type: Number
    },
    specialty:{
        type: String,
        required: true,
		unique: true
    },
	availability: {
		type: Boolean,
		required: true
	}
})

schema.plugin(AutoIncrement, {inc_field: '_id', start_seq: 1, id: 'Specialty_Id'});
mongoose.model('specialties', schema);
