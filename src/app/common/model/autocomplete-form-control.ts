import {FormControl} from '@angular/forms';
import {merge, Observable, of, Subject} from 'rxjs';
import {catchError, debounceTime, filter, map, mapTo, share, switchMap, take, takeWhile, tap} from 'rxjs/operators';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';

export class AutocompleteFormControl<T> extends FormControl {

  showSpinnerStream = new Subject();
  private clearStream = new Subject();
  private reloadStream = new Subject();
  private reloadAllStream = new Subject();

  filteredList: Observable<T[]> = merge(
    merge(
      merge(this.valueChanges, this.reloadStream).pipe(
        debounceTime(300),
        filter(name => typeof name === 'string' && name.length > 1),
        map(name => name && name.trim())
      ),
      this.reloadAllStream
    ).pipe(
      tap(() => this.showSpinnerStream.next(true)),
      switchMap(name => this.dataLoadFn(name).pipe(catchError(() => of([])))),
      tap(() => this.showSpinnerStream.next(false))
    ),
    this.clearStream.pipe(mapTo([]))
  ).pipe(share());

  dataLoadFn: (str: string) => Observable<T[]> = (str: string) => of([]);

  clearFilteredList() {
    this.clearStream.next();
  }

  reload(input: HTMLInputElement, autocompleteTrigger: MatAutocompleteTrigger) {
    input.focus();
    this.filteredList
      .pipe(
        take(1),
        takeWhile(() => autocompleteTrigger != null)
      )
      .subscribe(() => autocompleteTrigger.openPanel());
    this.reloadStream.next(this.value);
  }

  reloadWoFilter(input: HTMLInputElement, autocompleteTrigger: MatAutocompleteTrigger) {
    input.focus();
    this.filteredList
      .pipe(
        take(1),
        takeWhile(() => autocompleteTrigger != null)
      )
      .subscribe(() => autocompleteTrigger.openPanel());
    this.reloadAllStream.next(this.value);
  }

  reloadAll(input: HTMLInputElement, autocompleteTrigger: MatAutocompleteTrigger) {
    input.focus();
    this.filteredList
      .pipe(
        take(1),
        takeWhile(() => autocompleteTrigger != null)
      )
      .subscribe(() => autocompleteTrigger.openPanel());
    this.reloadAllStream.next('');
  }
}
