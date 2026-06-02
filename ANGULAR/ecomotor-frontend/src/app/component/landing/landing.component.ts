import { Component } from '@angular/core';

// Importa el servicio Router. Se utiliza para navegar entre las diferentes rutas  o páginas de la aplicación.
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})

export class LandingComponent {

  private toastTimer: any;

  constructor(private router: Router) {}

  //Función que redirige al usuario a la página de inicio de sesión. Se ejecuta cuando el usuario pulsa el botón "Iniciar sesión".
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  //Función que redirige al usuario al formulario de registro.
  goToRegister(): void {
    this.router.navigate(['/login'], { queryParams: { modo: 'registro' } });
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

  //Función que desplaza suavemente la página hasta una sección específica.
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  //Funcion que lleva al demo de CNN
  goToDemo(): void {
    this.router.navigate(['/computerVision'])
  }


}
