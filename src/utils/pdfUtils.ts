import * as XLSX from 'xlsx';

interface StudentEntry {
  NPM?: string;
  npm?: string;
  NAMA?: string;
  nama?: string;
}

async function readExcelFile(filePath: string): Promise<StudentEntry[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      console.error('Failed to fetch Excel file:', filePath, response.status, response.statusText);
      return [];
    }
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

// PDF file paths with obfuscated names for security
const PDF_PATHS = {
  PRAKTIKAN: '/data/cert/c3rt_p.pdf',  // Certificate for regular students
  ASLAB: '/data/cert/c3rt_a.pdf',      // Certificate for lab assistants
  INDIVIDUAL: {
    PRAKTIKAN: (npm: string) => `/data/cert/p/${npm}.pdf`,  // Individual praktikan certificates
    ASLAB: (npm: string) => `/data/cert/a/${npm}.pdf`       // Individual aslab certificates
  }
};

export async function getCertificatePage(npm: string, isAslab: boolean): Promise<Blob | null> {
  try {
    // First try to get individual certificate
    const individualPath = isAslab 
      ? PDF_PATHS.INDIVIDUAL.ASLAB(npm)
      : PDF_PATHS.INDIVIDUAL.PRAKTIKAN(npm);
    
    let response = await fetch(individualPath);
    
    // If individual certificate not found, fall back to the main certificate
    if (!response.ok) {
      const mainPath = isAslab ? PDF_PATHS.ASLAB : PDF_PATHS.PRAKTIKAN;
      response = await fetch(mainPath);
      
      if (!response.ok) {
        console.error('Failed to fetch PDF:', mainPath, response.status, response.statusText);
        return null;
      }
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return null;
  }
}

// Function to get individual certificate URL
export function getCertificateUrl(npm: string, isAslab: boolean): string {
  return isAslab 
    ? PDF_PATHS.INDIVIDUAL.ASLAB(npm)
    : PDF_PATHS.INDIVIDUAL.PRAKTIKAN(npm);
} 