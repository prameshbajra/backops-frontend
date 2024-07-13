import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SignInResponse } from '../../models/SignInResponse';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {
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
          console.log(response);
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
