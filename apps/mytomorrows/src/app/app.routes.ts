import { Route } from '@angular/router';

// import { StudiesListComponent } from './features/studies/studies-list.component.component'
export const appRoutes: Route[] = [
    {
        path: 'studies',
        loadComponent: () =>
          import('./features/studies/studies-list.component').then(
            (c) => c.StudiesListComponent
          ),
          title: 'Dashboard'
      },
];
