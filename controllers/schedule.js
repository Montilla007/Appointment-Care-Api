const Schedule = require('../models/Schedule');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getSchedule = async (req, res, next) => {
    try {
        // Extract doctorId or patientId from the URL parameters
        const { id } = req.params;

        // Find schedules where either doctorId or patientId matches the provided id
        const schedules = await Schedule.find({ $or: [{ doctorId: id }, { patientId: id }] });

        if (schedules.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'No schedules found' });
        }

        res.status(StatusCodes.OK).json({ schedules });
    } catch (error) {
        next(error);
    }
};

const requestSchedule = async (req, res) => {
    // Extract patient and doctor IDs from request body
    const { id } = req.params;
    const { doctorId, date } = req.body;

    try {
        // Create a new schedule entry
        const schedule = await Schedule.create({ patientId: id, doctorId, date });

        res.status(StatusCodes.CREATED).json({ schedule });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};

const verifySchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { patientId, status, date } = req.body; 

        const backUp = await Schedule.findOne({ doctorId: id, patientId });

        const localDate = backUp.localDate;

        let update = { $set: { status } }; // Default update object with the provided status

        if (status === 'Accepted') {
            update.$set.localDate = date; // If status is 'Accepted', set localDate to the provided date
            update.$set.date = date;
        }
        else if (status === 'Rejected') { 
            console.log('date:', date); // Log the value of date
            console.log('localDate:', localDate); // Log the value of localDate
            if (localDate !== null) {
                console.log("2")
                update.$set.date = localDate; // If status is 'Rejected', set localDate to the provided date 
            } else {
                update.$set.localDate = null; // If status is 'Rejected', set localDate to null
            }
        }

        const schedule = await Schedule.findOneAndUpdate(
            { doctorId: id, patientId: patientId },
            update,
            { new: true }
        );

        if (!schedule) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'No schedules found' });
        }

        res.status(StatusCodes.OK).json({ schedule });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

const editSchedule = async (req, res) => {
    try {
        const { id } = req.params; 
        const { date, status } = req.body; // New date for rescheduling

        // Find the schedule by ID
        const schedule = await Schedule.findOne({ patientId: id });

        if (!schedule) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Schedule not found' });
        }

        // Check if the schedule status is 'Accepted'
        if (schedule.status !== "Accepted") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Cannot reschedule. Schedule status is not "Accepted"' });
        }

        // Update the schedule with the new date
        schedule.date = date;
        schedule.status = status;
        await schedule.save();

        res.status(StatusCodes.OK).json({ message: 'Schedule successfully updated' });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

// Implement other controller methods for accepting/rejecting and rescheduling appointments

module.exports = { getSchedule, requestSchedule, verifySchedule, editSchedule };