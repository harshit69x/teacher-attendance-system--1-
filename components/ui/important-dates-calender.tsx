    "use client"

import { useState, useEffect } from "react"
import { Calendar as ReactCalendar } from "react-calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Plus, Star, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the type for important dates
interface ImportantDate {
  id: string
  date: Date
  title: string
  description?: string
  type: "exam" | "meeting" | "holiday" | "other"
}

// CSS for react-calendar
const calendarStyles = `
  .react-calendar {
    width: 100%;
    max-width: 100%;
    background: white;
    border-radius: 0.5rem;
    font-family: inherit;
  }
  .react-calendar--doubleView {
    width: 700px;
  }
  .react-calendar--doubleView .react-calendar__viewContainer {
    display: flex;
    margin: -0.5em;
  }
  .react-calendar--doubleView .react-calendar__viewContainer > * {
    width: 50%;
    margin: 0.5em;
  }
  .react-calendar,
  .react-calendar *,
  .react-calendar *:before,
  .react-calendar *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  .react-calendar button {
    margin: 0;
    border: 0;
    outline: none;
  }
  .react-calendar button:enabled:hover {
    cursor: pointer;
  }
  .react-calendar__navigation {
    display: flex;
    height: 44px;
    margin-bottom: 1em;
  }
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 1rem;
    font-weight: 500;
  }
  .react-calendar__navigation button:disabled {
    opacity: 0.5;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #e6e6e6;
    border-radius: 0.25rem;
  }
  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
  }
  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
  }
  .react-calendar__month-view__weekNumbers .react-calendar__tile {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75em;
    font-weight: bold;
  }
  .react-calendar__month-view__days__day--weekend {
    color: #d10000;
  }
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #757575;
  }
  .react-calendar__year-view .react-calendar__tile,
  .react-calendar__decade-view .react-calendar__tile,
  .react-calendar__century-view .react-calendar__tile {
    padding: 2em 0.5em;
  }
  .react-calendar__tile {
    max-width: 100%;
    padding: 10px 6.6667px;
    background: none;
    text-align: center;
    line-height: 16px;
    position: relative;
  }
  .react-calendar__tile:disabled {
    background-color: #f0f0f0;
    color: #ababab;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #e6e6e6;
    border-radius: 0.25rem;
  }
  .react-calendar__tile--now {
    background: #ffff76;
    border-radius: 0.25rem;
  }
  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: #ffffa9;
  }
  .react-calendar__tile--hasActive {
    background: #76baff;
  }
  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: #a9d4ff;
  }
  .react-calendar__tile--active {
    background: #3b82f6;
    color: white;
    border-radius: 0.25rem;
  }
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #2563eb;
  }
  .react-calendar--selectRange .react-calendar__tile--hover {
    background-color: #e6e6e6;
  }
  .important-date-marker {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
  }
  .important-date-marker span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .important-date-marker .exam {
    background-color: #ef4444;
  }
  .important-date-marker .meeting {
    background-color: #3b82f6;
  }
  .important-date-marker .holiday {
    background-color: #10b981;
  }
  .important-date-marker .other {
    background-color: #a855f7;
  }
`

export default function ImportantDatesCalendar() {
  const [value, setValue] = useState<Date>(new Date())
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([])
  const [newEvent, setNewEvent] = useState<Omit<ImportantDate, "id">>({
    date: new Date(),
    title: "",
    description: "",
    type: "other",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState<ImportantDate[]>([])

  // Load important dates from localStorage on component mount
  useEffect(() => {
    const savedDates = localStorage.getItem("importantDates")
    if (savedDates) {
      const parsedDates = JSON.parse(savedDates).map((date: any) => ({
        ...date,
        date: new Date(date.date),
      }))
      setImportantDates(parsedDates)
    }
  }, [])

  // Save important dates to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("importantDates", JSON.stringify(importantDates))
  }, [importantDates])

  // Update events for selected date when date or important dates change
  useEffect(() => {
    if (selectedDate) {
      const events = importantDates.filter(
        (date) =>
          date.date.getDate() === selectedDate.getDate() &&
          date.date.getMonth() === selectedDate.getMonth() &&
          date.date.getFullYear() === selectedDate.getFullYear(),
      )
      setEventsForSelectedDate(events)
    }
  }, [selectedDate, importantDates])

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return

    const newEventWithId: ImportantDate = {
      ...newEvent,
      id: Date.now().toString(),
    }

    setImportantDates([...importantDates, newEventWithId])
    setNewEvent({
      date: selectedDate || new Date(),
      title: "",
      description: "",
      type: "other",
    })
    setIsDialogOpen(false)
  }

  const handleDeleteEvent = (id: string) => {
    setImportantDates(importantDates.filter((date) => date.id !== id))
  }

  // Function to check if a date has important events
  const hasImportantDate = (date: Date) => {
    return importantDates.some(
      (d) =>
        d.date.getDate() === date.getDate() &&
        d.date.getMonth() === date.getMonth() &&
        d.date.getFullYear() === date.getFullYear(),
    )
  }

  // Function to get event types for a specific date
  const getEventTypesForDate = (date: Date) => {
    return importantDates
      .filter(
        (d) =>
          d.date.getDate() === date.getDate() &&
          d.date.getMonth() === date.getMonth() &&
          d.date.getFullYear() === date.getFullYear(),
      )
      .map((d) => d.type)
  }

  // Custom tile content to show markers for important dates
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null

    const eventTypes = getEventTypesForDate(date)
    if (eventTypes.length === 0) return null

    // Create a set of unique event types
    const uniqueTypes = [...new Set(eventTypes)]

    return (
      <div className="important-date-marker">
        {uniqueTypes.map((type, index) => (
          <span key={index} className={type}></span>
        ))}
      </div>
    )
  }

  // Get badge color based on event type
  const getBadgeColor = (type: ImportantDate["type"]) => {
    switch (type) {
      case "exam":
        return "bg-red-500 hover:bg-red-600"
      case "meeting":
        return "bg-blue-500 hover:bg-blue-600"
      case "holiday":
        return "bg-green-500 hover:bg-green-600"
      case "other":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <Card className="hover-card">
      <style>{calendarStyles}</style>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Important Dates
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-blue">
                <Plus className="h-4 w-4 mr-1" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Important Date</DialogTitle>
                <DialogDescription>Create a new important date or event.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    className="col-span-3"
                    value={newEvent.date.toISOString().split("T")[0]}
                    onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="event-title"
                    className="col-span-3"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="event-description"
                    className="col-span-3"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-type" className="text-right">
                    Type
                  </Label>
                  <select
                    id="event-type"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as ImportantDate["type"] })}
                  >
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                    <option value="holiday">Holiday</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddEvent}>
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>Mark and track important dates and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ReactCalendar
              onChange={setValue}
              value={value}
              onClickDay={handleDateClick}
              tileContent={tileContent}
              className="border rounded-md"
            />
            <div className="flex justify-center mt-4 gap-4">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs">Exam</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs">Meeting</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs">Holiday</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full inline-block mr-1"></span>
                <span className="text-xs">Other</span>
              </div>
            </div>
          </div>

          <div>
            <div className="border rounded-md p-4 h-full">
              <h3 className="font-medium mb-4 flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                {selectedDate ? (
                  <span>Events for {selectedDate.toLocaleDateString()}</span>
                ) : (
                  <span>Select a date to view events</span>
                )}
              </h3>

              {selectedDate && eventsForSelectedDate.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No events for this date</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setNewEvent({
                        date: selectedDate,
                        title: "",
                        description: "",
                        type: "other",
                      })
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Event
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {eventsForSelectedDate.map((event) => (
                  <div key={event.id} className="border rounded-md p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge className={cn("mt-1", getBadgeColor(event.type))}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground mt-2">{event.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
