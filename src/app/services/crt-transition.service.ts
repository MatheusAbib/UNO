
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrtTransitionService {
  private transitionSubject = new Subject<string>();

  transition$ = this.transitionSubject.asObservable();

  navigate(url: string): void {
    this.transitionSubject.next(url);
  }
}
