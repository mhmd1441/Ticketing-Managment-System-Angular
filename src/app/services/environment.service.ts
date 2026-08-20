import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private config: any;

  constructor() {
    this.config = (window as any).__env || {};
  }

  getApiUrl(endpointKey: string): string {
    return (
      this.config.apiBaseUrl + (this.config.endpoints?.[endpointKey] || '')
    );
  }

  get currentTerm(): string {
    return this.config.currentTerm || '';
  }
  get faculties(): string[] {
    return this.config.faculties || [];
  }
  get categories(): string[] {
    return this.config.categories || [];
  }
  get tags(): string[] {
    return this.config.tags || [];
  }
  get statuses(): string[] {
  return this.config.statuses || [];
}
}
