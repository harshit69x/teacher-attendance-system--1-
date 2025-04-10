"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, FileText, Upload } from "lucide-react"

// Replace with your secure keys - these would normally be environment variables
const OCR_API_KEY = "K89469803888957"
const GEMINI_API_KEY = "AIzaSyBGR9Y2TgP8nt2KYrPdbJ5BAA-WGE_bGyk"

interface NoteItem {
  type: string
  key?: string
  value: string | TextSegment[]
  isBold?: boolean
  bullet?: boolean
}

interface TextSegment {
  type: string
  text: string
}

export default function ShortNotes() {
  const [file, setFile] = useState<File | null>(null)
  const [notesData, setNotesData] = useState<NoteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Function to parse Gemini response
  function parseGeminiResponse(text: string): NoteItem[] {
    const lines = text.split("\n").filter((line) => line.trim() !== "")
    const parsed: NoteItem[] = []

    lines.forEach((line) => {
      // Case 1: Bullet + Bold Key-Value pair: • **Key:** Value
      const bulletBoldMatch = line.match(/^•\s+\*\*(.+?)\*\*:\s*(.*)/)
      if (bulletBoldMatch) {
        parsed.push({
          type: "section",
          key: bulletBoldMatch[1].trim(),
          value: processBoldText(bulletBoldMatch[2].trim()),
          isBold: true,
          bullet: true,
        })
        return
      }

      // Case 2: Bold Key-Value pair: **Key:** Value
      const boldMatch = line.match(/^\*\*(.+?)\*\*:\s*(.*)/)
      if (boldMatch) {
        parsed.push({
          type: "section",
          key: boldMatch[1].trim(),
          value: processBoldText(boldMatch[2].trim()),
          isBold: true,
          bullet: false,
        })
        return
      }

      // Case 3: Bullet list with plain text: • value
      const bulletOnlyMatch = line.match(/^•\s+(.*)/)
      if (bulletOnlyMatch) {
        parsed.push({
          type: "bullet-point",
          value: processBoldText(bulletOnlyMatch[1].trim()),
        })
        return
      }

      // Case 4: Fallback: Plain text (may contain inline bold)
      parsed.push({
        type: "text",
        value: processBoldText(line.trim()),
      })
    })

    return parsed
  }

  // Helper function to process inline bold text
  function processBoldText(text: string): string | TextSegment[] {
    // If text contains no bold markers, return it as is
    if (!text.includes("**")) return text

    // Extract parts marked as bold and create an array of segments
    const segments: TextSegment[] = []
    let currentIndex = 0

    // Find all **text** patterns
    const boldPattern = /\*\*(.+?)\*\*/g
    let match

    while ((match = boldPattern.exec(text)) !== null) {
      // Add any text before this bold section
      if (match.index > currentIndex) {
        segments.push({
          type: "regular",
          text: text.substring(currentIndex, match.index),
        })
      }

      // Add the bold text (without the ** markers)
      segments.push({
        type: "bold",
        text: match[1], // The captured group inside **
      })

      // Update current position
      currentIndex = match.index + match[0].length
    }

    // Add any remaining text after the last bold section
    if (currentIndex < text.length) {
      segments.push({
        type: "regular",
        text: text.substring(currentIndex),
      })
    }

    return segments
  }

  // Handler for file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError("")
      setSuccess("")
      setNotesData([])
    }
  }

  // Function to extract text from PDF using OCR.Space
  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", pdfFile)
    formData.append("language", "eng")
    formData.append("isOverlayRequired", "false")

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: OCR_API_KEY,
      },
      body: formData,
    })
    const result = await response.json()
    return result?.ParsedResults?.[0]?.ParsedText || ""
  }

  // Function to generate short notes using Gemini API
  const generateWithGemini = async (text: string): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const body = {
      contents: [
        {
          parts: [
            {
              text: `Create detailed notes from the give text:\n\n${text}`,
            },
          ],
        },
      ],
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    // Extract the notes text from the Gemini response
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
  }

  // Main handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a PDF file first.")
      return
    }
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    setNotesData([])

    try {
      // Step 1: Extract text from the PDF file
      const text = await extractTextFromPDF(file)
      if (!text.trim()) {
        setError("No text found in the PDF.")
        setIsLoading(false)
        return
      }

      // Step 2: Generate notes via Gemini API
      const summary = await generateWithGemini(text)
      if (!summary.trim()) {
        setError("No summary generated from Gemini.")
        setIsLoading(false)
        return
      }

      // Step 3: Parse the Gemini response into structured data
      const parsedNotes = parseGeminiResponse(summary)
      setNotesData(parsedNotes)
      setSuccess("Short notes generated successfully!")
    } catch (err) {
      console.error("Error:", err)
      setError("An error occurred during processing.")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to render content with inline bold formatting
  const renderFormattedContent = (content: string | TextSegment[]) => {
    if (typeof content === "string") return content

    return content.map((segment, i) =>
      segment.type === "bold" ? <strong key={i}>{segment.text}</strong> : <span key={i}>{segment.text}</span>,
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <FileText className="h-6 w-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold">Generate Short Notes</h1>
        </div>

        <p className="text-muted-foreground mb-8">
          Upload a PDF document to extract text and generate short, concise notes. The system extracts the text from the
          document, sends it to Gemini for summarization, and then displays the results.
        </p>

        <Card className="mb-8 hover-card">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Select a PDF file to generate notes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">{file ? `Selected: ${file.name}` : "No file selected"}</p>
              </div>

              <Button type="submit" disabled={isLoading || !file} className="bg-gradient-blue hover:opacity-90">
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Generating Notes...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Generate Short Notes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Render the generated notes */}
        {notesData.length > 0 && (
          <Card className="mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Generated Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <div className="space-y-4">
                {notesData.map((item, index) => {
                  if (item.type === "section") {
                    return (
                      <div key={index} className="mt-3 mb-2">
                        {item.bullet && <span className="mr-1">•</span>}
                        <strong>{item.key}:</strong> <span>{renderFormattedContent(item.value)}</span>
                      </div>
                    )
                  }
                  if (item.type === "bullet-point") {
                    return (
                      <div key={index} className="pl-4 flex">
                        <span className="mr-2">•</span>
                        <span>{renderFormattedContent(item.value)}</span>
                      </div>
                    )
                  }
                  return (
                    <p key={index} className="text-muted-foreground">
                      {renderFormattedContent(item.value)}
                    </p>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
