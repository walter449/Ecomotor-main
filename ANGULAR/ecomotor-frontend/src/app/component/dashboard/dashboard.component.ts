import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculosService } from '../../services/vehiculos.service';
import { RtmService } from '../../services/rtm.service';
import { Router } from '@angular/router';
import { MantenimientosService } from '../../services/mantenimientos.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private toastTimer: any;
  vehiculos: any[] = [];
  vehiculo: any = null;

  nuevoVehiculo = {
    placa: '',
    marca: '',
    modelo: '',
    anio: null,
    combustible: 'Gasolina',
    kilometraje: null,
    fechaRtm: '',
    id_usuario: null
  };

  mantenimientos: any[] = [];

  nuevoMantenimiento = {
    tipo: '',
    fecha: '',
    kilometraje: null,
    costo: null,
    id_vehiculo: null
  };

  openModalMantenimiento(): void {
    if (!this.vehiculo) {
      this.showToast('⚠️ Primero registra un vehículo');
      return;
    }
    this.nuevoMantenimiento.id_vehiculo = this.vehiculo.id;
    document.getElementById('modal-mantenimiento')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeModalMantenimiento(): void {
    document.getElementById('modal-mantenimiento')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeModalMantenimientoOutside(e: Event): void {
    if (e.target === document.getElementById('modal-mantenimiento')) this.closeModalMantenimiento();
  }

  registrarMantenimiento(): void {
    this.mantenimientosService.registrarMantenimiento(this.nuevoMantenimiento).subscribe({
      next: () => {
        this.closeModalMantenimiento();
        this.showToast('🔧 Mantenimiento registrado');
        this.cargarMantenimientos();
      },
      error: (err) => {
        console.error(err);
        this.showToast('❌ Error al registrar mantenimiento');
      }
    });
  }

  cargarMantenimientos(): void {
    if (!this.vehiculo) return;
    this.mantenimientosService.getMantenimientosPorVehiculo(this.vehiculo.id).subscribe({
      next: (data) => {
        this.mantenimientos = data;

        this.vehiculo.totalInvertido =
          this.calcularTotalInvertido(this.vehiculo);

      },
      error: (err) => console.error(err)
    });
  }


  constructor(private vehiculosService: VehiculosService, private rtmService: RtmService, private mantenimientosService: MantenimientosService, private router: Router) { }

  seleccionarVehiculo(id: number): void {
    this.vehiculo = this.vehiculos.find(v => v.id === id);
    if (this.vehiculo) {

      this.vehiculo.ecoScore =
        this.calcularEcoScore(this.vehiculo);

    }
  }

  ngOnInit(): void {

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.nuevoVehiculo.id_usuario = usuario.id;

    this.vehiculosService.getVehiculosPorUsuario(usuario.id).subscribe({
      next: (data) => {
        this.vehiculos = data;
        if (data.length > 0) this.vehiculo = data[0];
      },
      error: (err) => console.error(err)
    });




    setTimeout(() => {
      const ring = document.getElementById('heroRing');
      if (ring) (ring as any).style.strokeDashoffset = '44';
    }, 500);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animation = 'fadeUp 0.6s ease both';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feat-card, .ods-card, .kpi-card, .tl-item')
      .forEach(el => observer.observe(el));

    this.vehiculosService.getVehiculosPorUsuario(usuario.id)
      .subscribe((data: any) => {

        this.vehiculos = data;

        if (this.vehiculos.length > 0) {

          this.vehiculo = this.vehiculos[0];

          this.cargarMantenimientos();

          this.vehiculo.ecoScore =
            this.calcularEcoScore(this.vehiculo);
        }

      });
  }

  switchTab(name: string, el: HTMLElement): void {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    document.getElementById('tab-' + name)?.classList.add('active');
    el.classList.add('active');
  }

  showToast(msg: string): void {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (!t || !msgEl) return;
    msgEl.textContent = msg;
    t.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  openModal(): void {
    document.getElementById('modal')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    document.getElementById('modal')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeModalOutside(e: Event): void {
    if (e.target === document.getElementById('modal')) this.closeModal();
  }

  registerVehicle(): void {
    this.vehiculosService.registrarVehiculo(this.nuevoVehiculo).subscribe({
      next: (res) => {
        const hoy = new Date();
        const fechaVencimiento = new Date(this.nuevoVehiculo.fechaRtm);
        const estado = fechaVencimiento >= hoy ? 'vigente' : 'vencida';

        const rtm = {
          fecha_vencimiento: this.nuevoVehiculo.fechaRtm,
          estado: estado,
          id_vehiculo: res.id
        };
        this.rtmService.registrarRtm(rtm).subscribe({
          next: () => {
            this.closeModal();
            this.showToast('🚗 Vehículo registrado exitosamente');
          },
          error: (err) => {
            console.error('Error RTM:', err);
            this.showToast('❌ Error al registrar la RTM');
          }
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.showToast('❌ Error al registrar el vehículo');
      }
    });
  }

  calcularEcoScore(vehiculo: any): number {
    let score = 100;
    // kilometraje
    if (vehiculo.kilometraje > 150000) {
      score -= 40;
    }
    else if (vehiculo.kilometraje > 80000) {
      score -= 25;
    }
    else if (vehiculo.kilometraje > 30000) {
      score -= 10;
    }

    // combustible
    switch (vehiculo.combustible.toLowerCase()) {

      case 'diesel':
        score -= 25;
        break;

      case 'gasolina':
        score -= 15;
        break;

      case 'hibrido':
        score -= 5;
        break;
    }

    return score;
  }

  calcularTotalInvertido(vehiculo: any): number {

    let total = 0;

    this.mantenimientos.forEach((m: any) => {

      if (m.id_vehiculo === vehiculo.id) {

        total += Number(m.costo);

      }

    });

    return total;
  }

  toggleCheck(el: HTMLElement): void {
    el.classList.toggle('checked');
    const box = el.querySelector('.check-box') as HTMLElement;
    box.textContent = el.classList.contains('checked') ? '✓' : '';
    const done = document.querySelectorAll('#tab-rtm .check-item.checked').length;
    const total = document.querySelectorAll('#tab-rtm .check-item').length;
    if (done === total) this.showToast('✅ Todos los ítems de la RTM completados');
  }

  filterTaller(el: HTMLElement): void {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    this.showToast('🔍 Filtrando talleres por: ' + el.textContent?.trim());
  }

  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
  logout(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}