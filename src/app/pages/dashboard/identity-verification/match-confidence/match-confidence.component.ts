// src/app/pages/dashboard/identity-verification/match-confidence/match-confidence.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ngx-match-confidence',
  template: `
    <ngx-solar [chartValue]="confidence"></ngx-solar>
    <div class="confidence-details">
      <div class="h4 value">{{ confidence }}%</div>
      <div class="details subtitle-2"><span>Match Confidence</span></div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .confidence-details {
      margin-top: 1rem;
      text-align: center;
    }
  `],
})
export class MatchConfidenceComponent implements OnChanges {
  @Input() confidence: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.confidence && typeof changes.confidence.currentValue !== 'number') {
      this.confidence = 0;
    }
  }
}