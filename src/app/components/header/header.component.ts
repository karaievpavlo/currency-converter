import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, of, pairwise, switchMap, tap } from "rxjs";
import { IOption } from "src/app/models/option.interface";
import { CurrencyService } from "src/app/services/currency.service";

@UntilDestroy()
@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderComponent implements OnInit {

  private readonly _selectedCurrencySource$ = new BehaviorSubject<IOption | undefined>({
    name: 'USD',
    value: 0
  });
  public readonly selectedCurrency$ = this._selectedCurrencySource$.asObservable();
  private readonly _selectedUAHSource$ = new BehaviorSubject<IOption | undefined>({
    name: 'UAH',
    value: 0
  });
  public readonly selectedUAH$ = this._selectedUAHSource$.asObservable();

  public readonly currencies$ = this._currencyService.currencies$
    .pipe(
      tap((currencies) => {
        currencies?.forEach((currency: IOption) => {
          switch (currency?.name) {
            case this._selectedCurrencySource$.value?.name:
              this._selectedCurrencySource$.next(currency);
              break;
            case this._selectedUAHSource$.value?.name:
              this._selectedUAHSource$.next(currency);
              break;
          }
        })
      })
    );

  constructor(
    private readonly _currencyService: CurrencyService
  ) {

  }
  
  ngOnInit(): void {
    this.selectedCurrency$
      .pipe(
        pairwise(),
        switchMap(([previousCurrency, currentCurrency]) => {
          if(previousCurrency?.name === currentCurrency?.name) {
            return of(currentCurrency);
          }

          return this._currencyService.getCurrenciesByBase(currentCurrency?.name);
        }),
        untilDestroyed(this)
      )
      .subscribe()
  }

  changeCurrency(value: IOption) {
    this._selectedCurrencySource$.next(value)
  }
}