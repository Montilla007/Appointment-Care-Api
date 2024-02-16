const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

const getProfile = async (req, res) => {
    try {
        const people = await User.find({});
        res.status(StatusCodes.OK).json(people);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
}
module.exports = {
    getProfile
}
