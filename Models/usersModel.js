const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const schema = new mongoose.Schema({
	_id: { 
		type: mongoose.SchemaTypes.Number 
	},
	email: { 
		type: String, 
		required: true, 
		unique: true, 
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Enter valid e-mail"] 
	},
	password: { 
		type: String, 
		required: true, 
	},
	SSN:{
		type: Number,
		required: true, 
		unique: true,
        match: [/[0-9]{14}/, "Invalid SSN"]
	},
	userId: {
		type: Number,
		require: true
	},
	role: { 
		type: String, 
		required: true, 
		enum: ['admin', 'doctor', 'patient', 'employee']
	},
	availability: {
		type: Boolean,
		required: true
	}
});

schema.plugin(AutoIncrement, {inc_field: "_id", start_seq: 1, id: 'Email_Id'});

mongoose.model("users", schema);
