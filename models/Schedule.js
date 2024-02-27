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
        enum: ['Pending', 'Accepted', 'Rejected', 'Request'],
        default: 'Pending'
    }
    // Other schedule details
});

module.exports = mongoose.model('Schedule', scheduleSchema);