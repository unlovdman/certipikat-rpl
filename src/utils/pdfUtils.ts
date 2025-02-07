import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';

interface StudentEntry {
  NPM?: string;
  npm?: string;
  NO?: number;
  no?: number;
  NAMA?: string;
  nama?: string;
}

async function readExcelFile(filePath: string): Promise<StudentEntry[]> {
  try {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return [];
  }
}

async function getStudentNumber(npm: string, isAslab: boolean): Promise<number | null> {
  try {
    const filePath = isAslab 
      ? '/src/assets/list-aslab/Aslab PBO_X.xlsx'
      : '/src/assets/list-praktikan-lulus/Praktikan Lulus PBO_X.xlsx';
    
    const entries = await readExcelFile(filePath);
    const student = entries.find(entry => (entry.NPM || entry.npm) === npm);
    
    if (student) {
      return (student.NO || student.no || 1) - 1; // Convert to 0-based index
    }
    return null;
  } catch (error) {
    console.error('Error getting student number:', error);
    return null;
  }
}

export async function getCertificatePage(npm: string, isAslab: boolean): Promise<Blob | null> {
  try {
    const studentNumber = await getStudentNumber(npm, isAslab);
    
    if (studentNumber === null) {
      throw new Error('Student not found in list');
    }

    // Get the appropriate PDF file
    const pdfPath = isAslab
      ? '/src/assets/sertifikat-aslab/All Sertifikat Aslab RPL.PBO.X.pdf'
      : '/src/assets/sertifikat-praktikan/All Sertifikat Praktikan RPL.PBO.X.pdf';

    const pdfResponse = await fetch(pdfPath);
    const pdfBytes = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Create a new PDF with just the student's page
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [studentNumber]);
    newPdf.addPage(page);

    const newPdfBytes = await newPdf.save();
    return new Blob([newPdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error getting certificate page:', error);
    return null;
  }
}

// Function to get individual certificate URL
export function getCertificateUrl(npm: string, isAslab: boolean): string {
  if (isAslab) {
    return `/src/assets/sertifikat-aslab/Sertifikat_Aslab_${npm}.pdf`;
  }
  return `/src/assets/sertifikat-praktikan/Sertifikat_${npm}.pdf`;
} 