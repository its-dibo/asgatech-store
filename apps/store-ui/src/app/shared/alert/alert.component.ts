import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Alert {
  message: string;
  status: 'ok' | 'error' | 'warn';
  big?: boolean;
}
/**
 * displays an alert
 * the message text can be HTML
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  @Input() alert?: Alert;
}
