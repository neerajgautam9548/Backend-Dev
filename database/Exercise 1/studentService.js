import Student from "student.js";

class StudentService {
	async createStudent(studentData) {
		try {
			const student = await Student.create(studentData);
			return { success: true, data: student };
		} catch (error) {
			return this.handleError(error);
		}
	}

	async getAllStudents(filters = {}, options = {}) {
		try {
			const { page = 1, limit = 10, sort = "-createdAt" } = options;
			const skip = (page - 1) * limit;

			const students = await Student.find(filters)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.lean();

			const total = await Student.countDocuments(filters);

			return {
				success: true,
				data: students,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			return this.handleError(error);
		}
	}

	async getStudentByEmail(email) {
		try {
			const student = await Student.findOne({ email: email });
			if (!student) {
				return {
					success: false,
					error: "Student not found with that email",
				};
			}
			return { success: true, data: student };
		} catch (error) {
			return this.handleError(error);
		}
	}

	async getStudentById(id) {
		try {
			const student = await Student.findById(id);
			if (!student) {
				return { success: false, error: "Student not found" };
			}
			return { success: true, data: student };
		} catch (error) {
			return this.handleError(error);
		}
	}

	async updateStudentGPA(id, newGPA) {
		try {
			const student = await Student.findByIdAndUpdate(
				id,
				{ $set: { gpa: newGPA } },
				{ new: true, runValidators: true },
			);

			if (!student) {
				return { success: false, error: "Student not found" };
			}
			return { success: true, data: student };
		} catch (error) {
			return this.handleError(error);
		}
	}

	async deleteStudent(id) {
		try {
			const student = await Student.findByIdAndDelete(id);
			if (!student) {
				return { success: false, error: "Student not found" };
			}
			return { success: true, data: student };
		} catch (error) {
			return this.handleError(error);
		}
	}

	handleError(error) {
		if (error.name === "ValidationError") {
			const errors = Object.values(error.errors).map(
				(err) => err.message,
			);
			return { success: false, errors };
		}
		if (error.code === 11000) {
			return {
				success: false,
				error: "Duplicate key error: Email already exists",
			};
		}
		if (error.name === "CastError") {
			return { success: false, error: "Invalid ID format" };
		}
		console.error("Service error:", error);
		return { success: false, error: "Internal server error" };
	}
}

export default new StudentService();
