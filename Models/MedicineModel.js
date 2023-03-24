const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const medicineSchema = new mongoose.Schema({
    _id: {
        type:Number
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
});

medicineSchema.plugin(AutoIncrement, {inc_field: '_id', start_seq: 1, id: 'Medicine_Id'});

mongoose.model('medicines', medicineSchema);