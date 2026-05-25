import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {

  private apiUrl = 'http://localhost:3000/vehiculos';

  constructor(private http: HttpClient) { }

  getVehiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerVehiculo(id: number) {
    return this.http.get(`http://localhost:3000/vehiculos/${id}`);
  }

  registrarVehiculo(vehiculo: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, vehiculo);
  }
  getVehiculosPorUsuario(id_usuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${id_usuario}`);
  }
}