import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@my-dashboard-support/auth/data-access';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-logincomponent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Expose signals to the template
  isSubmitting = this.authService.isSubmitting;
  apiError = this.authService.errorMessage;

  loginForm = this.fb.nonNullable.group({
    username: ['', [
       Validators.required,
      //  Validators.minLength(4),
      //  Validators.maxLength(30),
      Validators.pattern(/^[\S]{4,30}$/)   //don't allow spaces
    ]],
    password: ['', [
      Validators.required, 
        // Validators.minLength(8),
        // Validators.maxLength(30),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[\S]{8,30}$/)
        //required , not wihte space length at least 8 and max 30 , upper letter ,lower letter, must contain special charchter and number
    ]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.getRawValue()).subscribe({
        next: () => this.router.navigate(['/hub'])
      });
    }
  }
}
