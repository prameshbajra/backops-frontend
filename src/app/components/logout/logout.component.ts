import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent {

  constructor(private authService: AuthService, private router: Router) {

  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('User logged out');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.log('Error logging out user', error);
      }
    });
  }

}
