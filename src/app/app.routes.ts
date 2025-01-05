import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ObjectViewerComponent } from './components/objects/object-viewer/object-viewer.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'view', component: ObjectViewerComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', component: HomeComponent, canActivate: [authGuard] }
];
