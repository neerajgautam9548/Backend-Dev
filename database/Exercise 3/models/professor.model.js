import mongoose from "mongoose";

const professorSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add the professor name"],
		},
		email: {
			type: String,
			required: true,
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please add a valid email",
			],
		},
		departments: [
			{
				type: String,
				required: true,
				enum: [
					"Computer Science",
					"Mathematics",
					"Physics",
					"Engineering",
					"Biology",
				],
			},
		],
		isTenured: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("Professor", professorSchema);
