import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AzureStorageService {
  
  constructor() {
    console.log('AzureStorageService initialized - Demo mode');
  }

  uploadFile(file: File, onProgress?: (progress: number) => void): Observable<string> {
    // Simulate upload for demo purposes
    console.log('Simulating file upload:', file.name);
    
    // Simulate progress updates
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress <= 100) {
          onProgress(progress);
        } else {
          clearInterval(interval);
        }
      }, 200);
    }
    
    // Return a mock URL after a delay
    const mockUrl = `https://stidentitypulsebulk.blob.core.windows.net/bulk-uploads/${Date.now()}-${file.name}`;
    return of(mockUrl).pipe(delay(1500));
  }

  listFiles(): Observable<string[]> {
    // Return mock file list
    return of([
      'sample-upload-1.csv',
      'sample-upload-2.csv',
      'sample-upload-3.csv'
    ]);
  }

  downloadFile(blobName: string): Observable<Blob> {
    // Return a mock blob
    const mockContent = 'FirstName,LastName,DateOfBirth,Country\nJohn,Doe,1990-01-15,Australia';
    const blob = new Blob([mockContent], { type: 'text/csv' });
    return of(blob);
  }
}