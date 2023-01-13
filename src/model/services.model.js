

var { Schema, model } = require("mongoose");

//User Schema
var ServicesSchema = Schema({
    id: {
        type: Number,
    },
    name: {
        type: String,
    },
    slots: {
        type: Array,
    },
}, { timestamps: true });

const Service = model("service", ServicesSchema);

module.exports = { Service };

