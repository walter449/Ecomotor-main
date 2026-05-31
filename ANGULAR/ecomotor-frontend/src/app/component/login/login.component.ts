import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  modo: 'login' | 'registro' = 'login';

  loginData = { email: '', password: '' };
  registroData = { nombre: '', email: '', password: '' };

  error = '';

  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.modo = params.get('modo') === 'registro' ? 'registro' : 'login';
    });
  }

  iniciarSesion(): void {
    this.usuariosService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (res) => {
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Email o contraseña incorrectos';
      }
    });
  }

  registrarse(): void {
    this.usuariosService.registro(
      this.registroData.nombre,
      this.registroData.email,
      this.registroData.password
    ).subscribe({
      next: () => {
        this.modo = 'login';
        this.error = '';
      },
      error: () => {
        this.error = 'Error al registrarse';
      }
    });
  }
}