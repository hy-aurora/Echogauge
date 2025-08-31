declare module "pdf2json" {
  interface PDFParser {
    on(event: "pdfParser_dataReady", callback: (data: any) => void): void;
    on(event: "pdfParser_dataError", callback: (error: any) => void): void;
    loadPDF(pdfFilePath: string): void;
  }
  
  class PDFParserClass implements PDFParser {
    on(event: "pdfParser_dataReady", callback: (data: any) => void): void
    on(event: "pdfParser_dataError", callback: (error: any) => void): void
    loadPDF(pdfFilePath: string): void
  }
  
  export = PDFParserClass
}