    import mongoose from "mongoose";

    const pointSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    at: { type: Date, default: Date.now }
    }, { _id: false });

    const tripSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    city: { type: String, required: true },
    destination: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
        address: { type: String }
    },
    status: {
        type: String,
        enum: ["active", "completed", "canceled"],
        default: "active"
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    locations: [pointSchema], // stores live tracking points
    lastETA: {
        text: { type: String },
        seconds: { type: Number },
        meters: { type: Number }
    }
    }, { timestamps: true });

    export default mongoose.model("Trip", tripSchema);
