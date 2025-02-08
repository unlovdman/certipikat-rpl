import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';

interface StudentEntry {
  NPM?: string;
  npm?: string;
  NO?: number;
  no?: number;
  NAMA?: string;
  Nama?: string;
  nama?: string;
}

interface StudentData {
  number: number;
  name: string;
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

async function getStudentData(npm: string, isAslab: boolean): Promise<StudentData | null> {
  try {
    const filePath = isAslab 
      ? '/data/p1/d4t4_x1_a.xlsx'
      : '/data/p1/d4t4_x1_l.xlsx';
    
    const entries = await readExcelFile(filePath);
    const student = entries.find(entry => (entry.NPM || entry.npm) === npm);
    
    console.log('Found student data:', student); // Debug log
    
    if (student) {
      const studentData = {
        number: (student.NO || student.no || 1) - 1,
        name: (student.NAMA || student.Nama || student.nama || '').trim()
      };
      console.log('Processed student data:', studentData); // Debug log
      return studentData;
    }
    return null;
  } catch (error) {
    console.error('Error getting student data:', error);
    return null;
  }
}

export async function getCertificatePage(npm: string, isAslab: boolean): Promise<{ blob: Blob | null; filename: string }> {
  try {
    const studentData = await getStudentData(npm, isAslab);
    console.log('Student data for certificate:', studentData); // Debug log
    
    if (studentData === null) {
      throw new Error('Student not found in list');
    }

    // Get the appropriate PDF file
    const pdfPath = isAslab
      ? '/data/cert/c3rt_a.pdf'
      : '/data/cert/c3rt_p.pdf';

    const pdfResponse = await fetch(pdfPath);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
    }
    
    const pdfBytes = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Create a new PDF with just the student's page
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [studentData.number]);
    newPdf.addPage(page);

    const newPdfBytes = await newPdf.save();
    const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
    
    // Generate filename with the new format
    const filename = `Sertifikat PBO_X - ${studentData.name} - ${npm}.pdf`;
    console.log('Generated filename:', filename); // Debug log
    
    return { blob, filename };
  } catch (error) {
    console.error('Error getting certificate page:', error);
    return { blob: null, filename: '' };
  }
}

// Function to get individual certificate URL
export function getCertificateUrl(npm: string, isAslab: boolean): string {
  if (isAslab) {
    return `/data/cert/cert_a_${npm}.pdf`;
  }
  return `/data/cert/cert_p_${npm}.pdf`;
} 