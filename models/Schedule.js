const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    localDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Request'],
        default: 'Pending'
    }
    // Other schedule details
});

module.exports = mongoose.model('Schedule', scheduleSchema);