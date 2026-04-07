import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Please add a course title"],
			trim: true,
		},
		courseCode: {
			type: String,
			required: [true, "Please add a course code"],
			unique: true,
			uppercase: true,
		},
		credits: {
			type: Number,
			required: true,
			min: [1, "Minimum 1 credit"],
			max: [6, "Maximum 6 credits"],
		},

		prerequisites: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
		],
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("Course", courseSchema);
