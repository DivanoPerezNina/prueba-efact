import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentsService } from '../services/documents.service';

export type DocumentKind = 'pdf' | 'xml' | 'cdr';

@Injectable()
export class DocumentsController implements OnDestroy {
  private readonly documentsService = inject(DocumentsService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  readonly ticket = signal(environment.defaultTicket ?? '');
  readonly selectedKind = signal<DocumentKind>('pdf');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly xmlText = signal('');
  readonly safeUrl = signal<SafeResourceUrl | null>(null);
  private objectUrl: string | null = null;

  ngOnDestroy() {
    this.revokeObjectUrl();
  }

  ensureSession(): boolean {
    const token = this.documentsService.getTokenSnapshot();
    if (!token) {
      this.router.navigateByUrl('/auth');
      return false;
    }
    return true;
  }

  select(kind: DocumentKind) {
    this.selectedKind.set(kind);
    this.xmlText.set('');
    this.safeUrl.set(null);
    this.loadCurrent();
  }

  async loadCurrent() {
    if (!this.ensureSession()) return;

    const ticket = this.ticket().trim();
    if (!ticket) {
      this.error.set('Ingresa un ticket.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.revokeObjectUrl();

    try {
      const blob = await firstValueFrom(this.fetchByKind(this.selectedKind(), ticket));

      if (this.selectedKind() === 'xml' || this.selectedKind() === 'cdr') {
        this.xmlText.set(await blob.text());
      } else {
        this.xmlText.set('');
      }

      const url = URL.createObjectURL(blob);
      this.objectUrl = url;
      this.safeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    } catch (err: unknown) {
      this.error.set(this.parseError(err));
    } finally {
      this.loading.set(false);
    }
  }

  downloadUrl(): string | null {
    return this.objectUrl;
  }

  logout() {
    this.documentsService.clearToken();
    this.router.navigateByUrl('/auth');
  }

  private fetchByKind(kind: DocumentKind, ticket: string): Observable<Blob> {
    switch (kind) {
      case 'xml':
        return this.documentsService.getXml(ticket);
      case 'cdr':
        return this.documentsService.getCdr(ticket);
      default:
        return this.documentsService.getPdf(ticket);
    }
  }

  private revokeObjectUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private parseError(err: unknown) {
    if (typeof err === 'string') return err;
    
    if (err && typeof err === 'object') {
      const httpError = err as any;
      const documentType = this.selectedKind().toUpperCase();
      
      // Errores HTTP específicos
      if (httpError.status === 404) {
        return `Documento ${documentType} no encontrado. Verifica que el ticket sea correcto.`;
      }
      if (httpError.status === 401) {
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      }
      if (httpError.status === 403) {
        return `No tienes permisos para acceder a este documento ${documentType}.`;
      }
      if (httpError.status === 400) {
        return 'El ticket proporcionado no es válido. Verifica el formato.';
      }
      if (httpError.status === 500 || httpError.status === 503) {
        return 'Error en el servidor. El servicio no está disponible en este momento.';
      }
      if (httpError.status === 0) {
        return 'No se puede conectar al servidor. Verifica tu conexión a internet.';
      }
      
      // Mensaje personalizado del error
      if (httpError.message) {
        return httpError.message;
      }
    }
    
    return `No se pudo cargar el documento ${this.selectedKind().toUpperCase()}. Intenta nuevamente.`;
  }
}
