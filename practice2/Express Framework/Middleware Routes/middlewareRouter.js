const fs = require("fs").promises;
const express = require("express");
const app = express();

app.use(express.json())

const PORT= 8000;
app.listen(PORT, () => {
  console.log("Server is listening on port:8000");
});

app.use((req,res,next)=>{
 console.log("i m middleware");
 next();
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  if (token !== "Bearer mysecrettoken") {
    return res.status(403).json({ message: "Invalid token" });
  }

  next();
};


app.put("/students/:id", authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Empty body not allowed" });
    }

    const students = await readStudentsFromFile();

    const index = students.findIndex(s => s.id === userId);
    if (index === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    students[index] = { ...students[index], ...req.body };

    await writeStudentsToFile(students);

    res.status(200).json({
      message: "Updated successfully",
      student: students[index]
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.use(async (req, res, next) => {
  try {
    const log = `${new Date().toLocaleString()} | ${req.method} | ${req.url}\n`;
    await fs.appendFile("./log.txt", log);
    next();
  } catch (err) {
    console.error("Log error:", err.message);
    next();
  }
});

// app.use((req,res,next)=>{
//   const log=`Request at:${new Date().toLocaleString()} method:${req.method}`
//   fs.appendFile("./log.txt","utf-8",(err)=>{
//     if(err){
//       console.log(err);
//     }
//   });
//   next();
// });

// app.get("/students/",loggerFile, async(req, res) => {
//     const students= await readStudentsFromFile();
//     return res.status(200).json(students);
// })

const readStudentsFromFile = async () => {
  const data = await fs.readFile("./students.json", "utf-8");
  return JSON.parse(data || "[]");
};

const writeStudentsToFile = async (records) => {
  await fs.writeFile("./students.json", JSON.stringify(records, null, 2));
};


app.put("/students/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Empty body not allowed" });
    }

    const existingStudents = await readStudentsFromFile();

    const foundIndex = existingStudents.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.status(404).send("Student not found");
    }

    existingStudents[foundIndex] = {
      ...existingStudents[foundIndex],
      ...req.body,
    };

    await writeStudentsToFile(existingStudents);

    return res.status(200).json({
      message: "Updated Successfully",
      student: existingStudents[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});


app.delete("/students/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const existingStudents = await readStudentsFromFile();

    const foundIndex = existingStudents.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.status(404).send("Student not found");
    }

    const deletedStudent = existingStudents.splice(foundIndex, 1);

    await writeStudentsToFile(existingStudents);

    return res.status(200).json({
      message: "Student deleted successfully",
      deletedStudent: deletedStudent[0],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});
