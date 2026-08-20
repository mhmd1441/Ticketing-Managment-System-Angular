import { Injectable } from '@angular/core';
import { Entry } from '../models/entry';

declare var pdfMake: any;

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  exportToCsv(entries: Entry[], filename: string): void {
    const headers = [
      'Ticket ID', 'Reporter ID', 'Staff ID', 'Faculty', 'Category',
      'Channel', 'Status', 'Description', 'Tags', 'Term', 'Start Date', 'End Date',
    ];

    const rows = entries.map((e) => [
      e.ticketId,
      e.reporterId,
      e.staffId,
      e.faculty,
      e.category,
      e.channel,
      e.status,
      e.description,
      (e.tags || []).join('; '),
      e.term,
      e.startDate,
      e.endDate || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => this.escapeCsvField(field)).join(','))
      .join('\n');

    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  exportToPdf(entries: Entry[], filename: string): void {
    const body = [
      ['Ticket ID', 'Reporter ID', 'Faculty', 'Category', 'Channel', 'Status'],
      ...entries.map((e) => [e.ticketId, e.reporterId, e.faculty, e.category, e.channel, e.status]),
    ];

    const docDefinition = {
      pageOrientation: 'landscape',
      content: [
        { text: 'Ticket Export', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', '*', '*'],
            body,
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 12] },
      },
    };

    pdfMake.createPdf(docDefinition).download(filename);
  }

  private escapeCsvField(field: string): string {
    const str = String(field ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
