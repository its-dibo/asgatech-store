import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AttributesDirective,
  CopyComponent,
  HypernatePipe,
  LengthPipe,
  Nl2brPipe,
} from '@engineers/ngx-utils';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { LazyLoadDirective } from '@engineers/ngx-lazy-load';
import { QuillModule } from 'ngx-quill';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

interface Obj {
  [key: string]: any;
}

export interface Article extends Obj {
  id?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  // todo: if(keywords:string)keywords=keywords.split(',').map(text=>({text}))
  // todo: Keyword[] | string[] | string;
  keywords?: Keyword[];
  cover?: Image;
  // todo: img?: string | Image
  author?: { name?: string; image?: string; link?: string };
  link?: string;
  createdAt?: string;
  updatedAt?: string;
  // whether to display the copy button
  copyButton?: boolean;
}

export interface Keyword extends Obj {
  text: string;
  count?: number | string;
  link?: string;
  target?: string;
}

// todo: convert <img data-ngx-img="img: Image"> to <img>
export interface Image {
  src?: string;
  srcset?: string;
  sizes?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ArticleOptions extends Obj {
  // tag used for title, default: <h1>
  titleTag?: 'h1' | 'h2' | 'h3';
  titleMaxLength?: number;
  // todo: move to options.quickActions[icon:content_copy, options:{getData()}]
  // returns:
  //  - string: a data template
  //  - array: arguments for copyGetData()
  //  - undefined: use the default this.onCopy()
  //  - null: disable the feature and don't add a copy button to the card
  onCopy?: (card: any) => string | [string, boolean] | undefined | null;
  onShare?: (card: any) => string | undefined | null;
  // add action elements to quickActions bar
  quickActions?: Array<QuickActionsElement>;

  /** the direction of the card's content part */
  contentDirection?: 'ltr' | 'rtl';
}

export interface QuickActionsElement {
  // material icon
  icon: string;
  action?: (card?: any) => any;
  tooltip?: string;
  // todo: pass options instead of action to control the default action instead of overriding it
  options?: { [key: string]: any };
}

export interface CopyData {
  card: HTMLElement;
  content?: HTMLElement | null;
  title?: string | null;
  link?: string;
  intro?: string;
  headers?: string[];
  hashtags?: string[];
}

export interface CopyDataOptions {
  // the template of the copied data
  template?: string;
  // whether to generate a summary from the card's content and add hashtags
  full?: boolean;
  // the max length of the intro
  maxLength?: number;
}

export type Payload = Article | Article[];

@Component({
  selector: 'ngx-content-card',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    LengthPipe,
    HypernatePipe,
    Nl2brPipe,
    MatCardModule,
    MatChipsModule,
    MatBadgeModule,
    MatButtonModule,
    LazyLoadDirective,
    // todo: .forRoot()?
    QuillModule,
    AttributesDirective,
    CopyComponent,
    MatProgressSpinnerModule,
    RouterModule,
    NgIf,
    NgFor,
  ],
})
export class NgxContentCardComponent {
  @Input() data?: Article | null;
  /**
   * whether the item is a part of a list or a standalone item
   * @deprecated
   */
  @Input() type: 'item' | 'list' = 'item';
  @Input() options: ArticleOptions = {};
  /** add arbitrary attributes to the card */
  @Input() attributes?: { [key: string]: any };
  opts!: ArticleOptions;
  /** add .invalid class to the card */
  @Input() invalid = false;
  @Output() titleClick = new EventEmitter<void>();
}
