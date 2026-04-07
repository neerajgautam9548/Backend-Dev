import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
	{
		student: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Student",
			required: [true, "Student reference is required"],
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Course",
			required: [true, "Course reference is required"],
		},
		score: {
			type: Number,
			min: 0,
			max: 100,
		},
		letterGrade: {
			type: String,
			enum: ["A", "B", "C", "D", "F", "Incomplete"],
			required: true,
		},
		semester: {
			type: String,
			required: true,
			example: "Fall 2024",
		},
	},
	{
		timestamps: true,
	},
);

gradeSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

export default mongoose.model("Grade", gradeSchema);
