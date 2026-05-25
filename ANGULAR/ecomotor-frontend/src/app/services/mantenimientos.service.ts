import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MantenimientosService {

  private apiUrl = 'http://localhost:3000/mantenimientos';

  constructor(private http: HttpClient) {}

  getMantenimientosPorVehiculo(id_vehiculo: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id_vehiculo}`);
  }

  registrarMantenimiento(mantenimiento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, mantenimiento);
  }
}