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
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  private toastTimer: any;

  //Lista de vehículos pertenecientes al usuario autenticado.
  vehiculos: any[] = [];
  //Vehículo actualmente seleccionado por el usuario.
  vehiculo: any = null;

  //almacenar temporalmente la información ingresada en el formulario de registro de vehículos
  nuevoVehiculo = {
    placa: '',
    marca: '',
    modelo: '',
    anio: null,
    kilometraje: null,
    id_usuario: null
  };

  //Almacena todos los mantenimientos asociados al vehículo seleccionado
  mantenimientos: any[] = [];
  //Modelo utilizado para almacenar la información ingresada en el formulario de registro de mantenimiento.
  nuevaOrden = {
    fecha: '',
    kilometraje: null,
    costo_total: null,
    id_taller: null,
    id_vehiculo: null
  };

  serviciosSeleccionados: number[] = [];

  tiposMantenimiento: any[] = [];

  talleres: any[] = [];

  /* Abre la ventana modal para registrar un mantenimiento. Antes de abrir el formulario verifica que exista un vehículo seleccionado. Si no existe, muestra una notificación de advertencia */
  openModalMantenimiento(): void {

  if (!this.vehiculo) {

    this.showToast('⚠️ Primero selecciona un vehículo');

    return;

  }

  this.nuevaOrden.id_vehiculo = this.vehiculo.id;

  this.serviciosSeleccionados = [];

  this.agregarServicio();

  this.cargarTiposMantenimiento();

  this.cargarTalleres();

  document
    .getElementById('modal-mantenimiento')
    ?.classList.add('open');

  document.body.style.overflow = 'hidden';

}

agregarServicio(): void {

  this.serviciosSeleccionados.push(null as any);

}

eliminarServicio(index: number): void {

  this.serviciosSeleccionados.splice(index, 1);

}

cargarTiposMantenimiento(): void {

  this.mantenimientosService
    .getTiposMantenimiento()
    .subscribe({

      next: (data) => {

        this.tiposMantenimiento = data;

      },

      error: (err) => {

        console.error(err);

      }

    });

}

cargarTalleres(): void {

  this.mantenimientosService
    .getTalleres()
    .subscribe({

      next: (data) => {

        this.talleres = data;

      },

      error: (err) => {

        console.error(err);

      }

    });

}

  /*Cierra la ventana modal de registro de mantenimiento y restablece el desplazamiento normal de la página*/
 closeModalMantenimiento(): void {

  document
    .getElementById('modal-mantenimiento')
    ?.classList.remove('open');

  document.body.style.overflow = '';

  this.nuevaOrden = {

    fecha: '',

    kilometraje: null,

    costo_total: null,

    id_taller: null,

    id_vehiculo: null

  };

  this.serviciosSeleccionados = [];

}

  /*Permite cerrar la ventana modal cuando el usuario hace clic fuera del contenido principal.*/
  closeModalMantenimientoOutside(e: Event): void {
    if (e.target === document.getElementById('modal-mantenimiento')) this.closeModalMantenimiento();
  }

 guardarOrdenMantenimiento(): void {

  const payload = {

    orden: this.nuevaOrden,

    servicios: this.serviciosSeleccionados

  };

  this.mantenimientosService
    .guardarOrden(payload)
    .subscribe({

      next: () => {

        this.closeModalMantenimiento();

        this.showToast(
          '✅ Mantenimiento registrado'
        );

        this.cargarMantenimientos();

      },

      error: (err) => {

        console.error(err);

        this.showToast(
          '❌ Error al registrar'
        );

      }

    });

}

  /* Consulta todos los mantenimientos asociados al vehículo seleccionado y los almacena para su visualización en la interfaz*/
  cargarMantenimientos(): void {
    if (!this.vehiculo) return;
    this.mantenimientosService.getMantenimientosPorVehiculo(this.vehiculo.id).subscribe({
      next: (data) => {
        this.mantenimientos = data;

       /* this.vehiculo.totalInvertido =
          this.calcularTotalInvertido(this.vehiculo);*/

      },
      error: (err) => console.error(err)
    });
  }


  /*
 * Constructor del componente.
 *
 * Inyecta los servicios necesarios para:
 * - Gestionar vehículos.
 * - Gestionar RTM.
 * - Gestionar mantenimientos.
 * - Navegar entre vistas.
 */
  constructor(
    private vehiculosService: VehiculosService, 
    private rtmService: RtmService, 
    private mantenimientosService: MantenimientosService, 
    private router: Router
  ) { }

  //Permite seleccionar un vehículo de la lista
  seleccionarVehiculo(id: number | null): void {
    if (!id) {
      this.vehiculo = null;
      this.mantenimientos = [];
      return;
    }

    this.vehiculo = this.vehiculos.find(v => v.id === Number(id)) || null;
    console.log('Vehículo seleccionado:', this.vehiculo);

    /*if (this.vehiculo) {
      this.vehiculo.ecoScore =
        this.calcularEcoScore(this.vehiculo);

      this.cargarMantenimientos();

    }*/
  }

  //Método del ciclo de vida de Angular
  ngOnInit(): void {

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.nuevoVehiculo.id_usuario = usuario.id;

    //Consulta al backend los vehículos asociados al usuario autenticado
    this.vehiculosService.getVehiculosPorUsuario(usuario.id).subscribe({
      next: (data) => {

        console.log('VEHICULOS RECIBIDOS:', data);

        this.vehiculos = data;
        this.vehiculo = null;
      },
      error: (err) => console.error(err)
    });

    //Crea un IntersectionObserver (animación)
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

  }

  //Función encargada de cambiar entre las diferentes pestañas o secciones del panel lateral
  switchTab(name: string, el: HTMLElement): void {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    document.getElementById('tab-' + name)?.classList.add('active');
    el.classList.add('active');
  }

  // Función encargada de mostrar una notificación tipo toast.
  showToast(msg: string): void {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (!t || !msgEl) return;
    msgEl.textContent = msg;
    t.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }

  //Función encargada de abrir la ventana modal
  openModal(): void {
    document.getElementById('modal')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  //Función encargada de cerrar la ventana modal
  closeModal(): void {
    document.getElementById('modal')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  //Función que permite cerrar el modal al hacer clic fuera de su contenido principal
  closeModalOutside(e: Event): void {
    if (e.target === document.getElementById('modal')) this.closeModal();
  }

  //registrar un vehiculo
  registerVehicle(): void {
    this.vehiculosService.registrarVehiculo(this.nuevoVehiculo).subscribe({
      next: (res) => {
        const hoy = new Date();
        //const fechaVencimiento = new Date(this.nuevoVehiculo.fechaRtm);
        //const estado = fechaVencimiento >= hoy ? 'vigente' : 'vencida';

        const rtm = {
         // fecha_vencimiento: this.nuevoVehiculo.fechaRtm,
         // estado: estado,
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

  /*calcularEcoScore(vehiculo: any): number {
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
    };*/

    // combustible
   /* switch (vehiculo.combustible.toLowerCase()) {

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
  }*/


  /*Gestiona el estado de los elementos de una lista de verificación relacionada con la RTM. Permite marcar y desmarcar ítems completados. Cuando todos los elementos han sido completados, muestra una notificación informativa.*/
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

  //Realiza un desplazamiento suave hacia una sección específica de la página.
  scrollToSection(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  //Cierra la sesión del usuario actual
  logout(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}