import { Routes } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { DocumentsPageComponent } from './pages/documents-page/documents-page.component';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'auth' },
	{ path: 'auth', component: AuthPageComponent },
	{ path: 'documents', component: DocumentsPageComponent },
	{ path: '**', redirectTo: 'auth' }
];
