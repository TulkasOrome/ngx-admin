import { Injectable } from '@angular/core';

export interface CSVRow {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  identificationNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CsvProcessorService {

  parseCSV(content: string): CSVRow[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have headers and at least one data row');
    }

    // Parse headers
    const headers = this.parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Map headers to our field names
    const fieldMap = {
      'firstname': 'firstName',
      'first_name': 'firstName',
      'first name': 'firstName',
      'lastname': 'lastName',
      'last_name': 'lastName',
      'last name': 'lastName',
      'dateofbirth': 'dateOfBirth',
      'date_of_birth': 'dateOfBirth',
      'date of birth': 'dateOfBirth',
      'dob': 'dateOfBirth',
      'country': 'country',
      'identification': 'identificationNumber',
      'id_number': 'identificationNumber',
      'id number': 'identificationNumber',
      'email': 'email',
      'phone': 'phone',
      'mobile': 'phone',
      'address': 'address',
      'city': 'city',
      'state': 'state',
      'postcode': 'postCode',
      'post_code': 'postCode',
      'post code': 'postCode',
      'zip': 'postCode'
    };

    // Parse data rows
    const data: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: any = {};
      
      headers.forEach((header, index) => {
        const fieldName = fieldMap[header] || header;
        if (values[index]) {
          row[fieldName] = values[index].trim();
        }
      });

      // Validate required fields
      if (row.firstName && row.lastName && row.dateOfBirth && row.country) {
        data.push(row as CSVRow);
      }
    }

    return data;
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  validateCSV(data: CSVRow[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.length === 0) {
      errors.push('No valid data rows found');
    }

    if (data.length > 1000) {
      errors.push('Maximum 1000 rows allowed per upload');
    }

    // Validate each row
    data.forEach((row, index) => {
      if (!row.firstName) {
        errors.push(`Row ${index + 2}: First name is required`);
      }
      if (!row.lastName) {
        errors.push(`Row ${index + 2}: Last name is required`);
      }
      if (!row.dateOfBirth) {
        errors.push(`Row ${index + 2}: Date of birth is required`);
      }
      if (!row.country) {
        errors.push(`Row ${index + 2}: Country is required`);
      }
      
      // Validate date format (YYYY-MM-DD or YYYYMMDD)
      if (row.dateOfBirth && !this.isValidDate(row.dateOfBirth)) {
        errors.push(`Row ${index + 2}: Invalid date format. Use YYYY-MM-DD or YYYYMMDD`);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors.slice(0, 10) // Limit error messages
    };
  }

  private isValidDate(date: string): boolean {
    // Accept YYYY-MM-DD or YYYYMMDD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{8}$/;
    return dateRegex.test(date);
  }

  generateSampleCSV(): string {
    const headers = 'FirstName,LastName,DateOfBirth,Country,Email,Phone,Address,City,State,PostCode';
    const sampleRows = [
      'John,Doe,1990-01-15,Australia,john.doe@email.com,0412345678,123 Main St,Sydney,NSW,2000',
      'Jane,Smith,1985-05-20,Indonesia,jane.smith@email.com,+6281234567890,Jl. Sudirman No. 45,Jakarta,DKI Jakarta,10210',
      'Ahmed,Hassan,1992-11-30,Malaysia,ahmed.h@email.com,+60123456789,50 Jalan Ampang,Kuala Lumpur,WP,50450'
    ];
    
    return headers + '\n' + sampleRows.join('\n');
  }
}