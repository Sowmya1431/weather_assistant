    import mongoose from "mongoose";

    const searchSchema = new mongoose.Schema(
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // link search to a specific user
        required: true,
        },
        city: {
        type: String,
        required: true,
        },
        weather: {
        type: Object, // store weather API response here
        default: {},
        },
        suggestions: {
        type: [String], // store suggestions (e.g., "Carry umbrella", "Wear sunscreen")
        default: [],
        },
        updated_at: {
        type: Date,
        default: Date.now, // store last fetched time
        },
    },
    { timestamps: true } // will also add createdAt & updatedAt automatically
    );

    export default mongoose.model("Search", searchSchema);
