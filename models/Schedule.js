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
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
    },
    imageData: {
        type: String,
        required: false,
    },
    number: {
        type: String,
        required: [true, 'Please provide number'],
    },
    online: {
        type: Boolean,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    localTime: {
        type: String,
        default: null
    },
    localDate: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Request', 'Dismiss', 'Done'],
        default: 'Pending'
    },
    symptoms: {
        type: [String],
        required: [false, 'Symptoms  is required for patients'],
        default: null,
    },
    observation: {
        type: String,
        required: [false, 'Observation is required for patients'],
        default: null,
    },
    prescription: {
        type: String,
        required: [false, 'Consultation is required for patients'],
        default: null,
    },
    // Other schedule details
});

module.exports = mongoose.model('Schedule', scheduleSchema);