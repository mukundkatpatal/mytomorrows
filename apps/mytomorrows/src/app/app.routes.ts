import { Route } from '@angular/router';
export const appRoutes: Route[] = [
    {
        path: 'studies',
        loadComponent: () =>
          import('./features/studies/studies-list.component').then(
            (c) => c.StudiesListComponent
          ),
          title: 'Studies'
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/favorites/favorites.component').then(
            (c) => c.FavoritesComponent
          ),
          title: 'Studies'
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then(
            (c) => c.HomeComponent
          ),
          title: 'Home'
      },
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home.component').then(
            (c) => c.HomeComponent
          ),
          title: 'Home'
      },
];
