import * as XLSX from 'xlsx';

export type PraktikumType = 'PBO' | 'Basis Data';
export type PraktikumPeriod = 'X' | 'XI' | 'XII';

interface PraktikumInfo {
  type: PraktikumType;
  period: PraktikumPeriod;
}

interface StudentData {
  npm: string;
  nama: string;
  status: 'lulus' | 'tidak lulus';
  praktikum: PraktikumInfo;
}

interface ExcelRow {
  NPM?: string;
  npm?: string;
  NAMA?: string;
  Nama?: string;
  nama?: string;
  [key: string]: any;
}

interface PraktikumPaths {
  list: string;
  lulus: string;
  aslab: string;
}

interface PraktikumConfig {
  [key: string]: {
    [key in PraktikumPeriod]?: PraktikumPaths;
  };
}

export class PraktikumNotAvailableError extends Error {
  constructor(praktikum: PraktikumType, period: PraktikumPeriod) {
    super(`Praktikum ${praktikum} periode ${period} belum dilaksanakan. Silakan cek kembali pada semester yang sesuai.`);
    this.name = 'PraktikumNotAvailableError';
  }
}

const CURRENT_PERIOD: PraktikumPeriod = 'X';

// Using obfuscated file names for security
const PRAKTIKUM_PATHS: PraktikumConfig = {
  'PBO': {
    'X': {
      list: '/data/p1/d4t4_x1.xlsx',
      lulus: '/data/p1/d4t4_x1_l.xlsx',
      aslab: '/data/p1/d4t4_x1_a.xlsx'
    }
  },
  'Basis Data': {
    'X': {
      list: '/data/p2/d4t4_x2.xlsx',
      lulus: '/data/p2/d4t4_x2_l.xlsx',
      aslab: '/data/p2/d4t4_x2_a.xlsx'
    }
  }
};

export function getCurrentPeriod(): PraktikumPeriod {
  return CURRENT_PERIOD;
}

export function getAvailablePeriods(praktikum: PraktikumType): PraktikumPeriod[] {
  return Object.keys(PRAKTIKUM_PATHS[praktikum] || {}) as PraktikumPeriod[];
}

async function fetchAndReadExcel(path: string) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.error('Failed to fetch file:', path, response.status, response.statusText);
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
}

export async function checkStudentStatus(
  npm: string, 
  praktikum: PraktikumType,
  period: PraktikumPeriod
): Promise<StudentData | null> {
  try {
    const paths = PRAKTIKUM_PATHS[praktikum]?.[period];
    if (!paths) {
      throw new PraktikumNotAvailableError(praktikum, period);
    }

    try {
      // Get student data from main list
      const data = await fetchAndReadExcel(paths.list);
      const student = data.find((row) => 
        String(row.NPM || row.npm || '').trim() === npm.trim()
      );
      
      if (student) {
        // Check if student has passed
        let isPassed = false;
        try {
          const passedData = await fetchAndReadExcel(paths.lulus);
          isPassed = passedData.some((row) => 
            String(row.NPM || row.npm || '').trim() === npm.trim()
          );
        } catch (error) {
          console.error('Error checking passed status:', error);
          // Continue with isPassed as false
        }

        return {
          npm: student.NPM || student.npm || npm,
          nama: student.NAMA || student.Nama || student.nama || '',
          status: isPassed ? 'lulus' : 'tidak lulus',
          praktikum: { type: praktikum, period }
        };
      }

      return null;
    } catch (error) {
      console.error('Error reading Excel file:', error);
      if (error instanceof PraktikumNotAvailableError) {
        throw error;
      }
      throw new PraktikumNotAvailableError(praktikum, period);
    }
  } catch (error) {
    console.error('Error in checkStudentStatus:', error);
    throw error;
  }
}

export async function isAslab(
  npm: string, 
  praktikum: PraktikumType,
  period: PraktikumPeriod
): Promise<boolean> {
  try {
    const paths = PRAKTIKUM_PATHS[praktikum]?.[period];
    if (!paths) {
      return false;
    }

    try {
      const data = await fetchAndReadExcel(paths.aslab);
      return data.some((row) => 
        String(row.NPM || row.npm || '').trim() === npm.trim()
      );
    } catch (error) {
      console.error('Error checking aslab status:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in isAslab:', error);
    return false;
  }
} 