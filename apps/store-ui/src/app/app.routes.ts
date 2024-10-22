import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./store/products/list/list.component'),
  },
  {
    path: 'orders',
    loadComponent: () => import('./store/orders/details/details.component'),
  },
];
