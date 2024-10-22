import { Product } from '#types/dto/product.dto';
import { Injectable, signal } from '@angular/core';

export interface Order {
  product: Product;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  orders = signal<Order[]>([]);

  getOrders() {
    return this.orders();
  }

  getOrder(orderId: number) {
    // todo: add id to each order in addOrder()
    // then filter orders[] by id
  }

  addOrder(order: Order) {
    this.orders.update((orders) => {
      orders.push(order);
      return orders;
    });
  }

  getTotalPrice() {
    return this.orders()
      .map((el) => el.count * el.product.ProductPrice)
      .reduce((el, acc) => {
        return el + acc;
      }, 0);
  }
}
