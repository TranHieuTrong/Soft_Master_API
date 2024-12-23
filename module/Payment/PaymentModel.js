const mongoose = require("mongoose");
const { Schema } = mongoose;

const PaymentSchema = new Schema(
    {
        userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
        courseID: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        // paymentMethod: { type: String, required: true },
        paymentDate: { type: Date, required: true },
        status: { type: String, required: true },
        total: { type: Number, required: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Payment", PaymentSchema);
