"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function Schedule() {
  const router = useRouter()
  const [teacher, setTeacher] = useState<any>(null)
  const [schedule, setSchedule] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [currentDay, setCurrentDay] = useState("")

  useEffect(() => {
    setIsMounted(true)
    // Get teacher data from localStorage
    const teacherData = localStorage.getItem("teacherData")
    if (!teacherData) {
      router.push("/")
      return
    }

    const teacher = JSON.parse(teacherData)
    setTeacher(teacher)

    // Set current day
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    setCurrentDay(days[new Date().getDay()])

    // Fetch schedule
    fetchSchedule(teacher.Id)
  }, [router])

  const fetchSchedule = async (teacherId: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/schedule/${teacherId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`)
      }

      const data = await response.json()
      setSchedule(data)
    } catch (err: any) {
      console.error("Error fetching schedule:", err)
      setError(err.message || "Failed to fetch schedule")
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) return null

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 mr-2 text-blue-600" />
        <h1 className="text-2xl font-bold">Weekly Schedule</h1>
      </div>

      <Card className="hover-card">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center justify-between">
            <span>Class Timetable</span>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              Today: {currentDay}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : !schedule ? (
            <div className="p-6">
              <Alert>
                <AlertDescription>No schedule data available</AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">Day</TableHead>
                    <TableHead>8:30 - 9:30</TableHead>
                    <TableHead>9:30 - 10:30</TableHead>
                    <TableHead>10:30 - 10:50</TableHead>
                    <TableHead>10:50 - 11:50</TableHead>
                    <TableHead>11:50 - 12:50</TableHead>
                    <TableHead>12:50 - 1:45</TableHead>
                    <TableHead>1:45 - 2:40</TableHead>
                    <TableHead>2:40 - 3:35</TableHead>
                    <TableHead>3:35 - 4:30</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.Schedule.map((daySchedule: any, dayIndex: number) => (
                    <TableRow key={dayIndex} className={daySchedule.Day === currentDay ? "bg-blue-50" : ""}>
                      <TableCell className="font-medium">
                        {daySchedule.Day === currentDay ? (
                          <span className="flex items-center">
                            {daySchedule.Day}
                            <Badge className="ml-2 bg-blue-500">Today</Badge>
                          </span>
                        ) : (
                          daySchedule.Day
                        )}
                      </TableCell>
                      {daySchedule.Periods.map((subject: string, periodIndex: number) => (
                        <TableCell
                          key={periodIndex}
                          className={`
                            ${periodIndex === 2 || periodIndex === 5 ? "bg-gray-50" : ""}
                            ${daySchedule.Day === currentDay ? "border-blue-100" : ""}
                          `}
                        >
                          {periodIndex === 2 ? (
                            <span className="text-muted-foreground italic">Break</span>
                          ) : periodIndex === 5 ? (
                            <span className="text-muted-foreground italic">Lunch</span>
                          ) : (
                            subject || "Free"
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
