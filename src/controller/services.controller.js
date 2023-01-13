const { StatusCodes } = require("http-status-codes");
const { Service } = require("../model/services.model");
const { response } = require("../utils/response");

const createService = async (req, res) => {
    const { id, name, slots } = req.body;

    if (!id || !name) {
        return response(
            res,
            StatusCodes.BAD_REQUEST,
            false,
            {},
            "Please Provide all information"
        );
    }

    try {
        const service = await Service.create({
            id: id,
            name: name,
            slots: slots,
        });

        if (!service) {
            return response(
                res,
                StatusCodes.FORBIDDEN,
                false,
                {},
                "Could not create service"
            );
        }

        return response(res, StatusCodes.ACCEPTED, true, { services: service }, null);
    } catch (error) {
        return response(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            false,
            {},
            error.message
        );
    }
};

module.exports = {
    createService
};