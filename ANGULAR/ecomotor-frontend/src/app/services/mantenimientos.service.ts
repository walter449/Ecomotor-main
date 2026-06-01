import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MantenimientosService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getMantenimientosPorVehiculo(
    idVehiculo: number
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/mantenimientos/${idVehiculo}`
    );
  }

  registrarMantenimiento(
    mantenimiento: any
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/mantenimientos`,
      mantenimiento
    );
  }

  getTiposMantenimiento(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/tipos-mantenimiento`
    );
  }

  getTalleres(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/talleres`
    );
  }

  guardarOrden(
    payload: any
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/ordenes-mantenimiento`,
      payload
    );
  }
}