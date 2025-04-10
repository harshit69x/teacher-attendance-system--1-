"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Star } from "lucide-react"
import ImportantDatesCalendar from "@/components/important-dates-calendar"

export default function ImportantDatesPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 mr-2 text-blue-600" />
        <h1 className="text-2xl font-bold">Important Dates</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ImportantDatesCalendar />

        <Card className="hover-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              Upcoming Important Dates
            </CardTitle>
            <CardDescription>Your next important events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <UpcomingEvents />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Component to display upcoming events
function UpcomingEvents() {
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  useEffect(() => {
    // Load important dates from localStorage
    const savedDates = localStorage.getItem("importantDates")
    if (savedDates) {
      const parsedDates = JSON.parse(savedDates).map((date: any) => ({
        ...date,
        date: new Date(date.date),
      }))

      // Filter for upcoming events (today and future)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming = parsedDates
        .filter((event: any) => {
          const eventDate = new Date(event.date)
          eventDate.setHours(0, 0, 0, 0)
          return eventDate >= today
        })
        .sort((a: any, b: any) => a.date - b.date)
        .slice(0, 5) // Get only the next 5 events

      setUpcomingEvents(upcoming)
    }
  }, [])

  // Get badge color based on event type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "exam":
        return "bg-red-100 text-red-800 border-red-200"
      case "meeting":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "holiday":
        return "bg-green-100 text-green-800 border-green-200"
      case "other":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No upcoming events</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {upcomingEvents.map((event) => (
        <div key={event.id} className="py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                event.type === "exam"
                  ? "bg-red-500"
                  : event.type === "meeting"
                    ? "bg-blue-500"
                    : event.type === "holiday"
                      ? "bg-green-500"
                      : "bg-purple-500"
              }`}
            ></div>
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs ${getBadgeColor(event.type)}`}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </div>
        </div>
      ))}
    </div>
  )
}
