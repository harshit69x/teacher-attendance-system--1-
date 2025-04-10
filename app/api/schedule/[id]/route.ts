import { NextResponse } from "next/server"
import mongoose from "mongoose"

// Connect to MongoDB
let isConnected = false

const connectToDatabase = async () => {
  if (isConnected) return

  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/teacher_databse")
    isConnected = true
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
  }
}

// Define the schedule schema
const teacherScheduleSchema = new mongoose.Schema(
  {
    Id: Number,
    Periods: [String],
    Timings: [String],
    Schedule: [
      {
        Day: String,
        Periods: [String],
      },
    ],
  },
  { collection: "teacher_schedule" },
)

// Get the model (or create it if it doesn't exist)
const TeacherSchedule = mongoose.models.TeacherSchedule || mongoose.model("TeacherSchedule", teacherScheduleSchema)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const teacherId = Number(params.id)

    // Find schedule by teacher ID
    const schedule = await TeacherSchedule.findOne({ Id: teacherId })

    if (!schedule) {
      return NextResponse.json({ message: "No schedule found for this teacher" }, { status: 404 })
    }

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ message: "Error fetching teacher schedule" }, { status: 500 })
  }
}
