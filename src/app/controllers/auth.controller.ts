import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentsService } from '../services/documents.service';

@Injectable()
export class AuthController {
  private readonly documentsService = inject(DocumentsService);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async login() {
    const username = this.username().trim();
    const password = this.password().trim();

    if (!username || !password) {
      this.error.set('Ingresa usuario y contraseña.');
      return;
    }

    this.error.set(null);
    this.loading.set(true);
    try {
      await firstValueFrom(
        this.documentsService.login(username, password)
      );
      await this.router.navigateByUrl('/documents');
    } catch (err: unknown) {
      this.error.set(this.parseError(err));
    } finally {
      this.loading.set(false);
    }
  }

  clearError() {
    this.error.set(null);
  }

  private parseError(err: unknown) {
    if (typeof err === 'string') return err;
    
    if (err && typeof err === 'object') {
      const httpError = err as any;
      
      // Errores HTTP específicos
      if (httpError.status === 401) {
        return 'Usuario o contraseña incorrectos. Verifica tus credenciales.';
      }
      if (httpError.status === 403) {
        return 'No tienes permisos para acceder. Contacta al administrador.';
      }
      if (httpError.status === 404) {
        return 'Servicio de autenticación no disponible. Intenta más tarde.';
      }
      if (httpError.status === 429) {
        return 'Demasiados intentos de inicio de sesión. Espera unos minutos.';
      }
      if (httpError.status === 500 || httpError.status === 503) {
        return 'Error en el servidor. Por favor, intenta más tarde.';
      }
      if (httpError.status === 0) {
        return 'No se puede conectar al servidor. Verifica tu conexión a internet.';
      }
      
      // Mensaje personalizado del error
      if (httpError.message) {
        return httpError.message;
      }
    }
    
    return 'Error al iniciar sesión. Por favor, intenta nuevamente.';
  }
}
