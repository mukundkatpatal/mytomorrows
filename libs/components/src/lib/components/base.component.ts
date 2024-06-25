import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
 
@Directive()
export class BaseComponent implements OnDestroy {
  protected destroyed$ = new Subject<void>();
 
  public ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}