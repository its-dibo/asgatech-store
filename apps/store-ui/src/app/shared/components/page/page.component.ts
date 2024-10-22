import { AlertComponent, type Alert } from '#app/shared/alert/alert.component';
import { NgFor, NgIf } from '@angular/common';
import { Component, effect, input, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Meta, MetaService } from '@engineers/ngx-utils';
import { meta } from '#configs/meta';

export interface Button {
  link: string;
  text: string;
  color?: string;
  tooltip?: string;
  icon?: string;
  /** a condition to display the button */
  cond?: boolean;
}

export interface FloatButton {
  link: string;
  tooltip?: string;
  color?: string;
  icon?: string;
  text?: string;
  cond?: boolean;
}

/**
 * page layout
 * includes:
 *  - a header container that contains a title, subtitle and buttons in a flex layout
 *  - an alert message board
 *  - floating buttons
 *  - a loading spinner
 */
@Component({
  selector: 'app-page',
  standalone: true,
  imports: [
    AlertComponent,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    NgIf,
    NgFor,
  ],
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss',
})
export class PageComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() alert?: Alert;
  @Input() buttons?: Button[];
  @Input() floatButtons?: FloatButton[];
  @Input() loading = false;
  @Input() spinnerDiameter = 100;
  @Input() spinnerWidth = 10;
  meta = input<Meta | undefined>(meta);

  constructor(private metaService: MetaService) {
    effect(() => {
      this.metaService.updateTags(this.meta());
    });
  }
}
