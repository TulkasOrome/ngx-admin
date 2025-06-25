import { Injectable } from '@angular/core';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AzureStorageService {
  private accountName = 'stidentitypulsebulk';
  private containerName = 'bulk-uploads';
  private sasToken = 'se=2026-06-25T10%3A29%3A03Z&sp=rwl&sv=2022-11-02&sr=c&sig=IOGJqyo4g%2BLv%2B2DyLz/nTdGkn%2Bj/GkrE%2BrDGYmhIqsM%3D';
  
  private containerClient: ContainerClient;

  constructor() {
    const blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net?${this.sasToken}`
    );
    this.containerClient = blobServiceClient.getContainerClient(this.containerName);
  }

  uploadFile(file: File, onProgress?: (progress: number) => void): Observable<string> {
    const blobName = `${Date.now()}-${file.name}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    return from(
      blockBlobClient.uploadData(file, {
        onProgress: (ev) => {
          if (onProgress && ev.loadedBytes) {
            const progress = (ev.loadedBytes / file.size) * 100;
            onProgress(Math.round(progress));
          }
        }
      })
    ).pipe(
      map(() => blockBlobClient.url),
      catchError(error => {
        console.error('Upload error:', error);
        throw error;
      })
    );
  }

  listFiles(): Observable<string[]> {
    const files: string[] = [];
    return from(
      (async () => {
        for await (const blob of this.containerClient.listBlobsFlat()) {
          files.push(blob.name);
        }
        return files;
      })()
    );
  }

  downloadFile(blobName: string): Observable<Blob> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    return from(blockBlobClient.download()).pipe(
      map(response => response.blobBody as Blob)
    );
  }
}