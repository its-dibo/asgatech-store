import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, NgStyle } from '@angular/common';
import { Article } from '@engineers/ngx-cards-mat';
import { Alert } from '#app/shared/alert/alert.component';
import { HttpClient } from '@angular/common/http';
import { Html2textPipe, Meta, MetaService } from '@engineers/ngx-utils';
import { NgxContentCardComponent } from '@engineers/ngx-cards-mat/src/cards.component/cards.component';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { meta } from '#configs/meta';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { PageComponent } from '#app/shared/components/page/page.component';
import { Product } from '#types/dto/product.dto';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { OrderDialogComponent } from '#app/store/orders/order-dialog/order-dialog.component';

// todo: pagination
@Component({
  selector: 'app-posts-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  imports: [
    NgxContentCardComponent,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    NgIf,
    NgFor,
    NgStyle,
    PageComponent,
    AsyncPipe,
  ],
  providers: [Html2textPipe],
})
export default class PostsListComponent {
  data$: Observable<(Article & Product)[]>;
  isLoading = signal(true);
  alert = signal<Alert | undefined>(undefined);
  meta = signal<Meta | undefined>(undefined);
  isGroupDescriptionExpanded = signal(false);

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.meta.set(meta);

    this.data$ = this.http.get<Product[]>(`api/products.json`).pipe(
      map((products) =>
        products.map((el) => ({
          ...el,
          title: el.ProductName,
          cover: { src: el.ProductImg },
        })),
      ),
      catchError((err) => {
        console.error('[API]', err);
        this.alert.set({
          status: 'error',
          message: err?.message || err,
          big: true,
        });
        return of();
      }),
      tap(() => {
        this.isLoading.set(false);
      }),
    );
  }

  order(item: Product) {
    this.dialog
      .open(OrderDialogComponent, { data: { item } })
      .afterClosed()
      .subscribe({
        next: (res) => console.log({ res }),
      });
  }
}
