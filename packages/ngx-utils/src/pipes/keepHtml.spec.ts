import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { describe, expect, test } from '@jest/globals';
import KeepHtmlPipe from './keepHtml';

// todo: test keepHtml(): Component.#ref.innerHTML=value

describe('keepHtml()', () => {
  test('keepHtml', () => {
    @Component({
      selector: 'comp',
      template: `<div #ref></div>`,
    })
    class AppComponent {
      keepHtml: KeepHtmlPipe;
      constructor(public sanitizer: DomSanitizer) {
        this.keepHtml = new KeepHtmlPipe(this.sanitizer);
      }

      ngOnInit() {
        void TestBed.configureTestingModule({
          imports: [BrowserTestingModule],
          declarations: [AppComponent],
          // we don't need to add DomSanitizer to providers[]
          // https://stackoverflow.com/a/39438086/12577650
        })
          .compileComponents()
          .then(() => {
            let fixture: ComponentFixture<AppComponent> =
              TestBed.createComponent(AppComponent);
            fixture.detectChanges();
            let sanitizer = fixture.componentInstance.sanitizer;
            let value = '<div>trusted html code</div>';
            let trustedValue: SafeHtml = {
              changingThisBreaksApplicationSecurity:
                '<div>trusted html code</div>',
            };

            // without injecting DomSanitizer
            expect(this.keepHtml.transform(value)).toEqual(trustedValue);
          });
      }
    }
  });

  test('it should keep the inserted html code with keepHtml()', () => {});
});
