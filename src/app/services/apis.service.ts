import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entry } from '../models/entry';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class ApisService {

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {}

  getEntries(): Observable<Entry[]> {
    const url = this.envService.getApiUrl('GetEntries');
    return this.http.get<Entry[]>(url);
  }

  submitEntry(payload: Entry): Observable<any> {
    const url = this.envService.getApiUrl('SubmitEntry');
    return this.http.post<any>(url, payload);
  }
}
