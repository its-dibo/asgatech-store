import { HttpClient } from '@angular/common/http';
import { Component, isDevMode } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MetaService } from '@engineers/ngx-utils';
import { Article, NgxContentCardComponent } from '@engineers/ngx-cards-mat';
import { Alert } from '#app/shared/alert/alert.component';
import { meta } from '#configs/meta';
import { CommonModule, PlatformLocation } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { User } from '#types/dto/user.dto';

@Component({
  selector: 'app-view-item',
  standalone: true,
  imports: [
    CommonModule,
    NgxContentCardComponent,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './view-item.component.html',
  styleUrl: './view-item.component.scss',
})
export default class ViewItemComponent {
  data: Article;
  alert: Alert;
  loading = true;

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private metaService: MetaService,
    private location: PlatformLocation,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.http
        .get<User>(`api/users/${params.get('id')}`)
        .subscribe({
          next: (res) => {
            if (!res.id) {
              this.alert = {
                status: 'error',
                message:
                  'cannot find the requested user <br /><a href="/">Go to home</a>',
              };
              return;
            }
            this.data = {
              author: {
                // todo: image
                name: `${res.firstName} ${res.lastName}`,
                link: `/user/${res.id}`,
              },
              content: '',
            };

            this.metaService.updateTags({
              ...meta,
              title: this.data.author?.name,
              url: this.data.author?.link,
              // todo:
              image: '',
              baseUrl: `${this.location.protocol}//${this.location.hostname}`,
            });
          },
          error: (error) => {
            this.alert = {
              status: 'error',
              message: error.message || error,
            };
            if (isDevMode()) console.error(error);
          },
        })
        .add(() => {
          this.loading = false;
        });
    });
  }
}
