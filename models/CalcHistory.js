
const mongoose = require("mongoose");
const historyschema = new mongoose.Schema({
    username : {
        type : String ,
        required : true },
    num1 : { type : Number , required : true},
    num2 : { type : Number , required : true},
    operation : { type : String , required : true},
    timestamp: { type: Date, default: Date.now },
    result :{ type : mongoose.Schema.Types.Mixed , required : true}

})

module.exports = mongoose.model("CalcHistory", historyschema);