import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Employee {
  name: string;
  totalTimeWorked: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiKey = 'vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==';
  private apiUrl = `https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=${this.apiKey}`;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }
}
