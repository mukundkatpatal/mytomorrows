import { Route } from '@angular/router';
/**
 * Create named chunks for each route
 */
export const appRoutes: Route[] = [
  {
    path: 'studies',
    loadComponent: () =>
      import('./features/studies/studies-list.component').then(
      (c) => c.StudiesListComponent
      ),
      title: 'Studies',
      data: { chunkName: 'studies'}
    },
    {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(
      (c) => c.FavoritesComponent
      ),
      title: 'Favorites',
      data: { chunkName: 'favorites'}
    },
    {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then(
      (c) => c.HomeComponent
      ),
      title: 'Home',
      data: { chunkName: 'home'}
    },
    {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then(
      (c) => c.HomeComponent
      ),
      title: 'Home',
      data: { chunkName: 'home'}
    },
];
