import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib'

/**
 * Utility functions for PDF manipulation using pdf-lib
 */

/**
 * Create a new PDF document with text content
 */
export async function createPDFWithText(text: string, title: string = "Document") {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const { width, height } = page.getSize()
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSize = 12
  const lineHeight = fontSize * 1.2
  
  // Add title
  page.drawText(title, {
    x: 50,
    y: height - 50,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  })
  
  // Add content
  const lines = text.split('\n')
  let yPosition = height - 100
  
  for (const line of lines) {
    if (yPosition < 50) {
      // Add new page if we run out of space
      const newPage = pdfDoc.addPage()
      yPosition = height - 50
    }
    
    page.drawText(line, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    })
    
    yPosition -= lineHeight
  }
  
  return await pdfDoc.save()
}

/**
 * Extract text from PDF using pdf-lib (basic implementation)
 * Note: pdf-lib is primarily for PDF creation/manipulation, not text extraction
 */
export async function extractTextFromPDF(pdfBytes: Uint8Array): Promise<string> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  let text = ""
  
  // Note: pdf-lib doesn't have built-in text extraction
  // This is a placeholder for when you might want to add text extraction
  // You would typically use pdf-parse or pdf2json for actual text extraction
  
  return text
}

/**
 * Merge multiple PDFs into one
 */
export async function mergePDFs(pdfBuffers: Uint8Array[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()
  
  for (const pdfBuffer of pdfBuffers) {
    const pdf = await PDFDocument.load(pdfBuffer)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }
  
  return await mergedPdf.save()
}

/**
 * Add watermark to PDF
 */
export async function addWatermark(pdfBytes: Uint8Array, watermarkText: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  pages.forEach((page) => {
    const { width, height } = page.getSize()
    
    // Add watermark in the center
    page.drawText(watermarkText, {
      x: width / 2 - 50,
      y: height / 2,
      size: 24,
      font,
      color: rgb(0.8, 0.8, 0.8), // Light gray
      opacity: 0.3,
    })
  })
  
  return await pdfDoc.save()
}
