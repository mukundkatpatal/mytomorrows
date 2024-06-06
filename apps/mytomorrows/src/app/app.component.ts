import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent
  ],
  selector: 'myt-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'mytomorrows';
}
