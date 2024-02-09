const getAllHome = async (req, res) => {
    res.send('Get All Home')
}

const getHome = async (req, res) => {
    res.send('Get Home')
}

const createHome = async (req, res) => {
    res.json(req.user)
    console.log("1")
}

const updateHome = async (req, res) => {
    res.send('Update Home')
}

const deleteHome = async (req, res) => {
    res.send('Delete Home')
}

module.exports = {
    getAllHome,
    getHome,
    createHome,
    updateHome,
    deleteHome,
}
