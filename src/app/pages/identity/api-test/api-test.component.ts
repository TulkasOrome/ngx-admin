// src/app/pages/identity/api-test/api-test.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-api-test',
  template: `
    <nb-card>
      <nb-card-header>
        <h5>IdentityPulse API Test</h5>
      </nb-card-header>
      <nb-card-body>
        <div class="test-info">
          <h6>API Configuration</h6>
          <pre>{{ apiInfo | json }}</pre>
        </div>
        
        <div class="test-section" *ngFor="let test of testCases">
          <h6>{{ test.name }}</h6>
          <button nbButton size="small" (click)="runTest(test)" [disabled]="test.loading">
            {{ test.loading ? 'Testing...' : 'Run Test' }}
          </button>
          <button nbButton size="small" status="info" (click)="runCurlEquivalent(test)" [disabled]="test.loading" style="margin-left: 10px;">
            Show cURL
          </button>
          <div class="curl-command" *ngIf="test.curlCommand">
            <h6>cURL equivalent:</h6>
            <pre>{{ test.curlCommand }}</pre>
          </div>
          <div class="result" *ngIf="test.result">
            <h6>Response:</h6>
            <pre>{{ test.result | json }}</pre>
          </div>
          <div class="error" *ngIf="test.error">
            <nb-alert status="danger">{{ test.error }}</nb-alert>
          </div>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .test-info {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f7f9fc;
      border-radius: 0.25rem;
    }
    .test-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #e4e9f2;
      border-radius: 0.25rem;
    }
    .result pre, .curl-command pre {
      margin-top: 1rem;
      background: #f7f9fc;
      padding: 1rem;
      border-radius: 0.25rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .error {
      margin-top: 1rem;
    }
  `]
})
export class ApiTestComponent implements OnInit {

  apiInfo: any;
  
  testCases = [
    {
      name: 'Test Australia - Daniel Friedman (Exact match from docs)',
      loading: false,
      result: null,
      error: null,
      curlCommand: null,
      data: {
        FirstName: 'Daniel',
        LastName: 'Friedman',
        DateOfBirth: '19570623',
        AddressLine: 'U 5/9 Elamang Avenue',
        City: 'Kirribilli',
        State: 'NSW',
        PostCode: '2061',
        Country: 'AU',
        Email: 'dan.windward@gmail.com',
        Phone: '0299224653',
        Mobile: '0448917243',
        MatchStrictness: 'normal'
      }
    },
    {
      name: 'Test Indonesia - Liem Hong (Exact match from docs)',
      loading: false,
      result: null,
      error: null,
      curlCommand: null,
      data: {
        FirstName: 'Liem',
        LastName: 'Hong',
        DateOfBirth: '19410513',
        Country: 'ID',
        Email: 'erlinaprayogo@yahoo.com',
        Mobile: '895333668255',
        NationalId: '3578155305410002',
        MatchStrictness: 'normal'
      }
    },
    {
      name: 'Test Malaysia - Goh Soon (Exact match from docs)',
      loading: false,
      result: null,
      error: null,
      curlCommand: null,
      data: {
        FirstName: 'Goh',
        LastName: 'Soon',
        DateOfBirth: '19631030',
        Country: 'MY',
        NationalId: '631030015045',
        Mobile: '0138453837',
        AddressLine: 'Jln 24/119 Taynton View',
        City: 'Taman Mutiara Barat',
        State: 'W.p Kuala Lumpur',
        MatchStrictness: 'normal'
      }
    },
    {
      name: 'Test Japan - Masako Furuno (Exact match from docs)',
      loading: false,
      result: null,
      error: null,
      curlCommand: null,
      data: {
        FirstName: 'Masako',
        LastName: 'Furuno',
        DateOfBirth: '19820827',
        Country: 'JP',
        Mobile: '819067715237',
        AddressLine: '畔蛸町, 鳥羽市, 5170033',
        MatchStrictness: 'normal'
      }
    }
  ];

  apiConfig = environment.identityPulseApi;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const isDev = !environment.production;
    this.apiInfo = {
      environment: isDev ? 'development' : 'production',
      baseUrl: this.apiConfig.baseUrl,
      endpoint: this.apiConfig.endpoint,
      azureFunctionKey: this.apiConfig.azureFunctionKey.substring(0, 20) + '...',
      apiKeys: Object.keys(this.apiConfig.apiKeys).reduce((acc, key) => {
        acc[key] = this.apiConfig.apiKeys[key].substring(0, 20) + '...';
        return acc;
      }, {})
    };
  }

  runTest(test: any) {
    test.loading = true;
    test.result = null;
    test.error = null;

    const isDevelopment = !environment.production;
    const baseUrl = isDevelopment ? '' : this.apiConfig.baseUrl;
    const url = `${baseUrl}${this.apiConfig.endpoint}?code=${this.apiConfig.azureFunctionKey}`;
    const apiKey = this.getApiKey(test.data.Country);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    });

    console.log('Testing:', test.name);
    console.log('URL:', url);
    console.log('API Key:', apiKey);
    console.log('Headers:', headers);
    console.log('Request Body:', JSON.stringify(test.data, null, 2));

    this.http.post(url, test.data, { headers })
      .subscribe(
        response => {
          test.loading = false;
          test.result = response;
          console.log('Success:', response);
        },
        error => {
          test.loading = false;
          const errorMsg = error.error?.message || error.message || error.statusText || 'Unknown error';
          test.error = `${error.status || 0}: ${errorMsg}`;
          console.error('Full error object:', error);
          
          // If it's a CORS error, provide more details
          if (error.status === 0) {
            test.error += '\n\nThis appears to be a CORS error. Make sure:\n';
            test.error += '1. You are running with: npm start (not ng serve)\n';
            test.error += '2. The proxy.conf.json file exists in your root directory\n';
            test.error += '3. Try the cURL command in a terminal to verify the API is working';
          }
        }
      );
  }

  runCurlEquivalent(test: any) {
    const apiKey = this.getApiKey(test.data.Country);
    const url = `${this.apiConfig.baseUrl}${this.apiConfig.endpoint}?code=${this.apiConfig.azureFunctionKey}`;
    
    const curlCommand = `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '${JSON.stringify(test.data, null, 2)}'`;
    
    test.curlCommand = curlCommand;
  }

  private getApiKey(country: string): string {
    const keys = {
      'AU': this.apiConfig.apiKeys.australia,
      'ID': this.apiConfig.apiKeys.indonesia,
      'MY': this.apiConfig.apiKeys.malaysia,
      'JP': this.apiConfig.apiKeys.japan
    };
    return keys[country] || this.apiConfig.apiKeys.multiRegion;
  }
}