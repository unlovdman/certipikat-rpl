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
    if (!response.ok) {
      throw new Error(`Failed to fetch Excel file: ${response.statusText} (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const entries = XLSX.utils.sheet_to_json<StudentEntry>(worksheet);
    console.log(`Read ${entries.length} entries from Excel file:`, entries); // Debug log
    return entries;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    console.error('File path attempted:', filePath);
    return [];
  }
}

async function getStudentData(npm: string, isAslab: boolean): Promise<StudentData | null> {
  try {
    const filePath = isAslab 
      ? '/data/p1/d4t4_x1_a.xlsx'
      : '/data/p1/d4t4_x1_l.xlsx';
    
    console.log('Attempting to read Excel file:', filePath); // Debug log
    const entries = await readExcelFile(filePath);
    
    if (entries.length === 0) {
      console.error('No entries found in Excel file');
      return null;
    }

    console.log('Looking for NPM:', npm); // Debug log
    let studentIndex = -1;
    const student = entries.find((entry, index) => {
      const entryNPM = entry.NPM || entry.npm;
      console.log('Comparing with entry NPM:', entryNPM); // Debug log
      if (entryNPM === npm) {
        studentIndex = index;
        return true;
      }
      return false;
    });
    
    console.log('Found student data:', student); // Debug log
    console.log('Student index in Excel:', studentIndex); // Debug log
    
    if (student) {
      // Get the actual number from the Excel, or use the array index + 1 if NO/no is not present
      const studentNumber = student.NO || student.no || (studentIndex + 1);
      console.log('Student number from Excel or index:', studentNumber); // Debug log

      const studentData = {
        number: studentNumber - 1, // Convert to 0-based index for PDF pages
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
    console.log('Starting certificate generation for NPM:', npm, 'isAslab:', isAslab);
    const studentData = await getStudentData(npm, isAslab);
    console.log('Student data for certificate:', studentData);
    
    if (studentData === null) {
      throw new Error('Data mahasiswa tidak ditemukan');
    }

    // Get the appropriate PDF file - use absolute path
    const pdfPath = isAslab
      ? './data/cert/c3rt_a.pdf'
      : './data/cert/c3rt_p.pdf';

    console.log('Attempting to fetch PDF from:', pdfPath);
    let pdfResponse;
    try {
      pdfResponse = await fetch(pdfPath, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/pdf'
        }
      });
      
      if (!pdfResponse.ok) {
        console.error('PDF fetch failed:', {
          status: pdfResponse.status,
          statusText: pdfResponse.statusText,
          path: pdfPath
        });
        throw new Error(`Gagal mengambil file sertifikat (${pdfResponse.status})`);
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error('Gagal mengakses file sertifikat');
    }

    // Verify we got a PDF response
    const contentType = pdfResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('pdf')) {
      console.error('Invalid content type:', contentType);
      throw new Error('Format file sertifikat tidak valid');
    }

    try {
      const pdfBytes = await pdfResponse.arrayBuffer();
      
      if (!pdfBytes || pdfBytes.byteLength === 0) {
        console.error('Empty PDF file received');
        throw new Error('File sertifikat kosong');
      }

      console.log('PDF file size:', pdfBytes.byteLength, 'bytes');

      const pdfDoc = await PDFDocument.load(pdfBytes, { 
        updateMetadata: false
      });
      
      const pageCount = pdfDoc.getPageCount();
      console.log(`Total PDF pages: ${pageCount}`);
      console.log(`Attempting to get page ${studentData.number} (Student number: ${studentData.number + 1})`);

      if (pageCount === 0) {
        throw new Error('File sertifikat tidak memiliki halaman');
      }

      if (studentData.number >= pageCount) {
        throw new Error(`Halaman sertifikat tidak valid (${studentData.number + 1})`);
      }

      // Create a new PDF with just the student's page
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [studentData.number]);
      
      if (!copiedPage) {
        throw new Error('Gagal menyalin halaman sertifikat');
      }
      
      newPdf.addPage(copiedPage);
      
      // Save with compression for smaller file size
      const newPdfBytes = await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50
      });
      
      if (!newPdfBytes || newPdfBytes.length === 0) {
        throw new Error('Gagal membuat file sertifikat');
      }

      const blob = new Blob([newPdfBytes], { 
        type: 'application/pdf'
      });
      
      if (blob.size === 0) {
        throw new Error('File sertifikat hasil kosong');
      }

      // Generate filename with the new format
      const filename = `Sertifikat PBO_X - ${studentData.name} - ${npm}.pdf`;
      console.log('Generated filename:', filename);
      console.log('Final blob size:', blob.size, 'bytes');
      
      return { blob, filename };
    } catch (pdfError) {
      console.error('PDF processing error:', pdfError);
      throw new Error('Gagal memproses sertifikat');
    }
  } catch (error) {
    console.error('Detailed error in getCertificatePage:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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