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
    super(`Praktikum ${praktikum} periode ${period} belum dilaksanakan`);
    this.name = 'PraktikumNotAvailableError';
  }
}

const CURRENT_PERIOD: PraktikumPeriod = 'X';

const PRAKTIKUM_PATHS: PraktikumConfig = {
  'PBO': {
    'X': {
      list: '/src/assets/list-praktikan/Praktikan PBO_X.xlsx',
      lulus: '/src/assets/list-praktikan-lulus/Praktikan Lulus PBO_X.xlsx',
      aslab: '/src/assets/list-aslab/Aslab PBO_X.xlsx'
    }
  },
  'Basis Data': {
    'X': {
      list: '/src/assets/list-praktikan/Praktikan Basis Data_X.xlsx',
      lulus: '/src/assets/list-praktikan-lulus/Praktikan Lulus Basis Data_X.xlsx',
      aslab: '/src/assets/list-aslab/Aslab Basis Data_X.xlsx'
    }
  }
};

export function getCurrentPeriod(): PraktikumPeriod {
  return CURRENT_PERIOD;
}

export function getAvailablePeriods(praktikum: PraktikumType): PraktikumPeriod[] {
  return Object.keys(PRAKTIKUM_PATHS[praktikum] || {}) as PraktikumPeriod[];
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

    // First check in the list of students
    try {
      const response = await fetch(paths.list);
      if (!response.ok) {
        throw new PraktikumNotAvailableError(praktikum, period);
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

      const student = data.find((row) => 
        String(row.NPM || row.npm || '').trim() === npm.trim()
      );
      
      if (student) {
        // Check if the student is in the passed list
        let isPassed = false;
        try {
          const passedResponse = await fetch(paths.lulus);
          if (passedResponse.ok) {
            const passedArrayBuffer = await passedResponse.arrayBuffer();
            const passedWorkbook = XLSX.read(passedArrayBuffer);
            
            const passedSheetName = passedWorkbook.SheetNames[0];
            const passedWorksheet = passedWorkbook.Sheets[passedSheetName];
            const passedData = XLSX.utils.sheet_to_json<ExcelRow>(passedWorksheet);

            isPassed = passedData.some((row) => 
              String(row.NPM || row.npm || '').trim() === npm.trim()
            );
          }
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
      if (error instanceof PraktikumNotAvailableError) {
        throw error;
      }
      throw new PraktikumNotAvailableError(praktikum, period);
    }
  } catch (error) {
    console.error('Error reading Excel file:', error);
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
      const response = await fetch(paths.aslab);
      if (!response.ok) {
        return false; // If aslab list is not available, assume not an aslab
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

      return data.some((row) => 
        String(row.NPM || row.npm || '').trim() === npm.trim()
      );
    } catch (error) {
      console.error('Error checking aslab status:', error);
      return false; // If there's an error reading aslab file, assume not an aslab
    }
  } catch (error) {
    console.error('Error in isAslab:', error);
    return false;
  }
} 