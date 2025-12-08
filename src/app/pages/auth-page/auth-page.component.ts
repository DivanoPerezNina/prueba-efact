import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthController } from '../../controllers/auth.controller';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css',
  providers: [AuthController]
})
export class AuthPageComponent {
  protected readonly ctrl = inject(AuthController);
  protected readonly ctrlSampleUser = environment.sampleCredentials.username;
  protected showPassword = false;

  onSubmit() {
    this.ctrl.login();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
