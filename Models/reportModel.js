const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const reportSchema = new mongoose.Schema({
    _id: {
        type:Number
    },
    name: {
        type: String,
        required: true,
    }
});

reportSchema.plugin(AutoIncrement, {inc_field: '_id', start_seq: 1, id: 'Report_Id'});

mongoose.model('reports', reportSchema);