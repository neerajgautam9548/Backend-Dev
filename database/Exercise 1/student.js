import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
		},
		email: {
			type: String,
			required: [true, "Please add an email"],
			unique: true,
		},
		gpa: {
			type: Number,
			required: [true, "Please add a GPA"],
			min: [0, "GPA cannot be less than 0"],
			max: [4.0, "GPA cannot be more than 4.0"],
		},
	},
	{
		timestamps: true,
	},
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
