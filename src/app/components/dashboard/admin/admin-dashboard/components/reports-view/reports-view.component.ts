import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reports-view',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './reports-view.component.html',
  styleUrls: ['./reports-view.component.scss']
})
export class ReportsViewComponent {
  @Output() exportPdf = new EventEmitter<void>();
  @Output() exportExcel = new EventEmitter<void>();
  @Output() generateReport = new EventEmitter<string>();

  onGenerateReport(reportType: string): void {
    this.generateReport.emit(reportType);
  }
}