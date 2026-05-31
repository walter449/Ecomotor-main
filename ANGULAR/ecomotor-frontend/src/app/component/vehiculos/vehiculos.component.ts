import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehiculosService } from '../../services/vehiculos.service';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehiculos.component.html',
  styleUrls: ['./vehiculos.component.css']
})
export class VehiculosComponent implements OnInit {

  vehiculos: any[] = [];
  ecoScore: number = 0;
  totalInvertido: number = 0;

  constructor(private vehiculosService: VehiculosService) {}

  ngOnInit(): void {
    
    this.vehiculosService.getVehiculos().subscribe({
      next: (data) => this.vehiculos = data,
      error: (err) => console.error('Error:', err)
    });
    
  }
}