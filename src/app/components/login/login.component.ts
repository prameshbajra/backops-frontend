import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SignInResponse } from '../../models/SignInResponse';
import { CognitoUserData, User } from '../../models/User';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  authService: AuthService = inject(AuthService);
  formBuilder: FormBuilder = inject(FormBuilder);
  router: Router = inject(Router);

  loginForm!: FormGroup;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.checkCurrentUser();
  }

  private checkCurrentUser(): void {
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      this.authService.getCurrentUser().subscribe({
        next: (cognitoUser: CognitoUserData) => this.handleUserLoginSuccess(cognitoUser),
        error: (error) => console.error('Error getting current user:', error)
      });
    }
  }

  private handleUserLoginSuccess(cognitoUser: CognitoUserData): void {
    const user: User = {
      id: cognitoUser.UserAttributes.find(attr => attr.Name === 'sub')?.Value,
      username: cognitoUser.Username,
      email: cognitoUser.UserAttributes.find(attr => attr.Name === 'email')?.Value
    };
    this.authService.currentUser.set(user);
    this.isLoading = false;
    this.router.navigate(['/']);
  }

  onLoginClick(): void {
    if (this.loginForm.invalid) {
      alert('Please fill in the required fields');
      return;
    }

    const { username, password } = this.loginForm.value;
    this.isLoading = true;
    this.authService.login(username, password).subscribe({
      next: (response: SignInResponse) => this.handleLoginSuccess(response),
      error: (error) => this.handleLoginError(error)
    });
  }

  private handleLoginSuccess(response: SignInResponse): void {
    const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;
    localStorage.setItem('idToken', IdToken);
    localStorage.setItem('accessToken', AccessToken);
    localStorage.setItem('refreshToken', RefreshToken);
    this.authService.getCurrentUser().subscribe({
      next: (cognitoUser: CognitoUserData) => this.handleUserLoginSuccess(cognitoUser),
      error: (error) => this.handleLoginError(error)
    });
  }

  private handleLoginError(error: any): void {
    try {
      if (error.error.error.name === 'UserNotFoundException') {
        alert('Wrong username or password');
      } else {
        alert('An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred. Please try again.');
    }
    this.isLoading = false;
  }
}
