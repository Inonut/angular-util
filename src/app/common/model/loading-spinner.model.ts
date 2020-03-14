import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerModel {
  private labels = new Set();

  private _loadingEvent = new BehaviorSubject(false);

  public get loadingEvent(): Observable<boolean> {
    return this._loadingEvent.asObservable();
  }

  public show(label?: string): void {
    label && this.labels.add(label);
    this._loadingEvent.next(true);
  }

  public close(label?: string): void {
    if (label) {
      if (this.labels.has(label)) {
        this.labels.delete(label);
      }
    }

    if (this.labels.size == 0) {
      this._loadingEvent.next(false);
    }
  }
}
