import { Component } from '@angular/core';
import { OrdersService } from '../orders.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [MatListModule, MatIconModule, MatDividerModule, RouterModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export default class DetailsComponent {
  constructor(public ordersService: OrdersService) {}
}
