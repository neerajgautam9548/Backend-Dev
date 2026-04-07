const avgGpaByDept = await Student.aggregate([
	{
		$group: {
			_id: "$department",
			averageGPA: { $avg: "$gpa" },
			studentCount: { $sum: 1 },
		},
	},
	{
		$set: {
			averageGPA: { $round: ["$averageGPA", 2] },
		},
	},
	{
		$sort: { averageGPA: -1 },
	},
]);

const popularCourses = await Grade.aggregate([
	{
		$group: {
			_id: "$course",
			enrollmentCount: { $sum: 1 },
		},
	},
	{
		$sort: { enrollmentCount: -1 },
	},
	{
		$limit: 5,
	},
	{
		$lookup: {
			from: "courses",
			localField: "_id",
			foreignField: "_id",
			as: "courseDetails",
		},
	},
	{
		$unwind: "$courseDetails",
	},
	{
		$project: {
			_id: 0,
			courseCode: "$courseDetails.courseCode",
			title: "$courseDetails.title",
			enrollmentCount: 1,
		},
	},
]);

const performanceReport = await Grade.aggregate([
	{
		$lookup: {
			from: "courses",
			localField: "course",
			foreignField: "_id",
			as: "courseInfo",
		},
	},
	{ $unwind: "$courseInfo" },
	{
		$group: {
			_id: "$student",
			totalCreditsAttempted: { $sum: "$courseInfo.credits" },
			averageScore: { $avg: "$score" },
			transcript: {
				$push: {
					courseCode: "$courseInfo.courseCode",
					title: "$courseInfo.title",
					score: "$score",
					letterGrade: "$letterGrade",
					semester: "$semester",
				},
			},
		},
	},
	{
		$lookup: {
			from: "students",
			localField: "_id",
			foreignField: "_id",
			as: "studentInfo",
		},
	},
	{ $unwind: "$studentInfo" },
	{
		$project: {
			_id: 0,
			studentId: "$_id",
			name: "$studentInfo.name",
			email: "$studentInfo.email",
			currentGPA: "$studentInfo.gpa",
			totalCreditsAttempted: 1,
			averageScore: { $round: ["$averageScore", 1] },
			transcript: 1,
		},
	},
]);
