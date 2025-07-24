import { PDFDocument } from "pdf-lib"
import * as pdfjs from "pdfjs-dist"

// Initialize PDF.js worker
// In a real app, you would need to set up the worker properly
// This is a simplified version for demonstration
const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry")
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

/**
 * Extract text from a PDF file using PDF.js
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

    // Get total number of pages
    const numPages = pdf.numPages
    console.log(`PDF has ${numPages} pages`)

    // Extract text from each page
    let fullText = ""

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      // Concatenate the text items
      const pageText = textContent.items.map((item: any) => item.str).join(" ")

      fullText += `\n\n--- Page ${i} ---\n\n${pageText}`
    }

    return fullText
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

/**
 * Get the number of pages in a PDF file
 */
export async function getPDFPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    return pdfDoc.getPageCount()
  } catch (error) {
    console.error("Error getting PDF page count:", error)
    return 0
  }
}
