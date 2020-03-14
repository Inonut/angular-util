import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {takeUntil} from 'rxjs/internal/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-input-search',
  templateUrl: './app-input-search.component.html',
  styleUrls: ['./app-input-search.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppInputSearchComponent),
    multi: true
  }],
  encapsulation: ViewEncapsulation.None
})
export class AppInputSearchComponent implements ControlValueAccessor, OnInit, OnDestroy {

  @Input() placeholderText = '';
  @Input() hasMagnifier = true;
  @Input() hasArrow = false;
  @Input() selectTextOnFocus = false;
  @Input() readonly = false;

  @HostBinding('class.app-input-search') inputSearchClass = true;
  @HostBinding('class.app-input-search-show-clear') showClearIcon = false;

  @Output() magnifierClicked = new EventEmitter();

  @ViewChild('inputElement', {static: true}) inputElement: ElementRef;

  searchInputFormControl: FormControl;

  private unsubscribed = new Subject();
  private _focusUnsubscribeStream: Subject<any>;

  constructor() {
    this.searchInputFormControl = new FormControl('');
  }

  @Input()
  set focusStream(stream: Subject<any>) {
    if (this._focusUnsubscribeStream) {
      this._focusUnsubscribeStream.next();
      this._focusUnsubscribeStream.complete();
    }
    this._focusUnsubscribeStream = new Subject();

    stream
      .pipe(takeUntil(this._focusUnsubscribeStream))
      .subscribe(() => {
        this.inputElement.nativeElement.focus();
        this.selectTextOnFocus && this.inputElement.nativeElement.setSelectionRange(0, this.inputElement.nativeElement.value.length);
      });
  }

  ngOnInit(): void {
    this.searchInputFormControl.valueChanges
      .pipe(takeUntil(this.unsubscribed))
      .subscribe((value: string) => {
        this.showClearIcon = value.length > 0;
        this.onChange(value);
      });
  }

  writeValue(formModel: string): void {
    this.searchInputFormControl.setValue(formModel || '', {emitEvent: false});
    this.showClearIcon = (formModel || '').length > 0;
  }

  startSearch() {
    this.magnifierClicked.emit();
  }

  clearSearch(event: MouseEvent) {
    this.searchInputFormControl.setValue('', {emitEvent: true});
    if (this.readonly) {
      event.stopPropagation();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public ngOnDestroy(): void {
    this.unsubscribed.next();
    this.unsubscribed.complete();
  }

  private onChange: (value: any) => void = () => {  };
  private onTouched: (value: any) => void = () => {  };
}
