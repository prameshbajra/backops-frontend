import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SignInResponse } from '../../models/SignInResponse';
import { Utility } from '../../utility';
import { User } from '../../models/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLoginClick() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.getRawValue();
      this.authService.login(username, password).subscribe({
        next: (response: SignInResponse) => {
          const idToken = response.AuthenticationResult.IdToken;
          const accessToken = response.AuthenticationResult.AccessToken;
          const refreshToken = response.AuthenticationResult.RefreshToken;
          localStorage.setItem('idToken', idToken);
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          const user: User = {
            username
          }
          this.authService.currentUser.set(user);
          this.router.navigateByUrl('/');
        },
        error: (error) => {
          if (error.error.name === 'UserNotFoundException') {
            alert('User not found');
          }
          console.error(error);
        }
      });
    } else {
      alert('Please fill in the required');
    }
  }

}
