import { Routes } from '@angular/router';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: FileUploadComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', component: FileUploadComponent, canActivate: [authGuard] }
];
