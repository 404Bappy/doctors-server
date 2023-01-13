const { Router } = require("express");
const {
    createService
} = require("../controller/services.controller");


const router = Router();

//api: url/course/__

//Subscription
router.post("/create", createService);


module.exports = router;