import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ngx-azure-test',
  template: `
    <nb-card>
      <nb-card-header>
        <h5>Azure Storage Configuration Test</h5>
      </nb-card-header>
      <nb-card-body>
        <button nbButton status="primary" (click)="testDirectAPI()">Test Direct API Call</button>
        <button nbButton status="info" (click)="testCORS()" style="margin-left: 10px;">Test CORS</button>
        
        <div class="results" *ngIf="results">
          <h6>Test Results:</h6>
          <pre>{{ results | json }}</pre>
        </div>
        
        <div class="cors-instructions" *ngIf="showCORSInstructions">
          <nb-alert status="warning">
            <strong>CORS Configuration Required!</strong><br><br>
            Please configure CORS in your Azure Storage Account:
            <ol>
              <li>Go to Azure Portal</li>
              <li>Navigate to your storage account: <strong>stidentitypulsebulk</strong></li>
              <li>Under Settings, click "Resource sharing (CORS)"</li>
              <li>Select "Blob service"</li>
              <li>Add these CORS rules:</li>
            </ol>
            <pre>{{ corsConfig | json }}</pre>
            <p>Current origin: <strong>{{ currentOrigin }}</strong></p>
          </nb-alert>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .results {
      margin-top: 20px;
      padding: 15px;
      background: #f7f9fc;
      border-radius: 4px;
    }
    .cors-instructions {
      margin-top: 20px;
    }
    pre {
      background: #f7f9fc;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class AzureTestComponent {
  results: any = null;
  showCORSInstructions = false;
  currentOrigin = window.location.origin;
  
  corsConfig = {
    allowedOrigins: [
      'http://localhost:4200',
      'https://identitypulse.azurestaticapps.net',
      '*'  // Or use * for testing, but be more specific in production
    ],
    allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['*'],
    exposedHeaders: ['*'],
    maxAgeInSeconds: 3600
  };

  constructor(private http: HttpClient) {}

  testDirectAPI() {
    const accountName = 'stidentitypulsebulk';
    const containerName = 'bulk-uploads';
    const sasToken = 'se=2026-06-25T10%3A29%3A03Z&sp=rwl&sv=2022-11-02&sr=c&sig=IOGJqyo4g%2BLv%2B2DyLz/nTdGkn%2Bj/GkrE%2BrDGYmhIqsM%3D';
    
    // Test listing blobs
    const url = `https://${accountName}.blob.core.windows.net/${containerName}?restype=container&comp=list&${sasToken}`;
    
    console.log('Testing URL:', url);
    
    this.http.get(url, { responseType: 'text' }).subscribe(
      response => {
        console.log('Success:', response);
        this.results = {
          status: 'success',
          message: 'Connection successful!',
          containerAccessible: true
        };
      },
      error => {
        console.error('Error:', error);
        this.results = {
          status: 'error',
          message: error.message,
          statusCode: error.status,
          error: error
        };
        
        if (error.status === 0) {
          this.showCORSInstructions = true;
        }
      }
    );
  }

  testCORS() {
    // Try a simple OPTIONS request
    const accountName = 'stidentitypulsebulk';
    const url = `https://${accountName}.blob.core.windows.net/`;
    
    fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'content-type'
      }
    })
    .then(response => {
      console.log('CORS test response:', response);
      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      };
      
      this.results = {
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        corsHeaders: corsHeaders,
        corsConfigured: !!corsHeaders['access-control-allow-origin']
      };
      
      if (!corsHeaders['access-control-allow-origin']) {
        this.showCORSInstructions = true;
      }
    })
    .catch(error => {
      console.error('CORS test error:', error);
      this.results = {
        status: 'error',
        message: 'CORS request failed',
        error: error.toString()
      };
      this.showCORSInstructions = true;
    });
  }
}