import {AfterViewInit, Directive, ElementRef, Host, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {MatTable} from '@angular/material/table';
import {IsxTableDataSource} from './isx-table-data-source.model';
import {combineLatest, Subject} from 'rxjs';
import {LoadingSpinnerModel} from '../model/loading-spinner.model';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: `[isxTableMessage]`,
  exportAs: 'isxTableMessage',
  // tslint:disable-next-line:no-host-metadata-property
  host: {
    class: 'isx-table-message'
  }
})
// tslint:disable-next-line:directive-class-suffix
export class IsxTableMessageDirecive implements OnInit, OnDestroy {

  private unsubscribed = new Subject();

  private messageDiv: Element;

  constructor(@Host() private host: MatTable<any>,
              private el: ElementRef,
              private loadingSpinnerModel: LoadingSpinnerModel,
              private renderer: Renderer2) {

    this.messageDiv = this.renderer.createElement('div');
    this.renderer.addClass(this.messageDiv, 'isx-message-placeholder');
    this.renderer.addClass(this.messageDiv, 'hidden');
    this.renderer.appendChild(this.el.nativeElement, this.messageDiv);
  }

  @Input('isx-table-message')
  set message(text: string) {
    if (this.messageDiv) {
      this.messageDiv.innerHTML = text;
    }
  }

  ngOnInit(): void {
    combineLatest([(this.host.dataSource as IsxTableDataSource<any>).connect(), this.loadingSpinnerModel.loadingEvent])
      .pipe(
        takeUntil(this.unsubscribed)
      )
      .subscribe(([data, spinner]) => {
        if ((data == null || data.length == 0) && !spinner) {
          this.renderer.removeClass(this.messageDiv, 'hidden');
        } else {
          this.renderer.addClass(this.messageDiv, 'hidden');
        }
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribed.next();
    this.unsubscribed.complete();
  }
}
