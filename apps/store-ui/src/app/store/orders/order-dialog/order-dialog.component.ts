import { FormComponent, SubmitEvent } from '#app/shared/form/form.component';
import { Product } from '#types/dto/product.dto';
import { Component, Inject, signal, Signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { Article, NgxContentCardComponent } from '@engineers/ngx-cards-mat';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { JsonPipe } from '@angular/common';
import { OrdersService } from '#app/store/orders/orders.service';

export interface DialogData {
  item: Article & Product;
}

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    NgxContentCardComponent,
    FormComponent,
    MatIconModule,
    MatInputModule,
    MatDividerModule,
    JsonPipe,
  ],
  templateUrl: './order-dialog.component.html',
  styleUrl: './order-dialog.component.scss',
})
export class OrderDialogComponent {
  data = signal<(Article & Product) | undefined>(undefined);
  fields: FormlyFieldConfig[];
  model: { [key: string]: any } = {};
  message = signal<string | undefined>(undefined);

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: DialogData,
    private ordersService: OrdersService,
  ) {}
  count: number = 1;

  ngOnInit(): void {
    let item = this.dialogData.item;
    this.data.set({
      ...item,
      title: 'order details',
      subtitle: item.title,
    });

    this.fields = [
      {
        key: 'count',
        type: 'input',
        defaultValue: 0,
        props: {
          type: 'number',
          label: 'count',
          required: true,
          max: item.AvailablePieces,
          min: 1,
          description: `in stock: ${item.AvailablePieces}`,
        },
        validation: {
          messages: {
            max: () =>
              `Only ${item.AvailablePieces} items are available in stock`,
          },
        },
      },
    ];
  }

  increase() {
    this.count++;
  }

  decrease() {
    this.count--;
  }

  submitOrder(ev: SubmitEvent) {
    this.ordersService.addOrder({
      count: ev.data.count,
      product: this.dialogData.item,
    });

    this.message.set(
      `Your shopping cart is updated successfully. total price is ${this.ordersService.getTotalPrice()}`,
    );
  }
}
