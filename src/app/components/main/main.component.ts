import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, filter, finalize, of, pairwise, skipWhile, switchMap, take, tap, timeout } from "rxjs";
import { IOption } from "src/app/models/option.interface";
import { CurrencyService } from "src/app/services/currency.service";

@UntilDestroy()
@Component({
  selector: 'app-main',
  templateUrl: 'main.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: flex;
      align-items: center; 
      min-height: calc(100vh - 152px - 16px);
      max-width: 1024px;
      margin: 0 auto;

      @media (min-width: 768px) {
        min-height: calc(100vh - 94px - 16px);
      }
    }
  `]
})

export class MainComponent implements OnInit {
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  
  private readonly _baseCurrencySource$ = new BehaviorSubject<IOption | undefined>({
    name: 'UAH',
    value: 1
  });
  public readonly baseCurrency$ = this._baseCurrencySource$.asObservable();
  private readonly _targetCurrencySource$ = new BehaviorSubject<IOption | undefined>({
    name: 'USD',
    value: 1
  });
  public readonly targetCurrency$ = this._targetCurrencySource$.asObservable();

  private readonly _baseCurrencyAmountSource$ = new BehaviorSubject<number | undefined>(1);
  public readonly baseAmountCurrency$ = this._baseCurrencyAmountSource$.asObservable();
  private readonly _targetCurrencyAmountSource$ = new BehaviorSubject<number | undefined>(1);
  public readonly targetAmountCurrency$ = this._targetCurrencyAmountSource$.asObservable();

  public readonly currencies$ = this._currencyService.currencies$
    .pipe(
      tap((currencies) => {
        currencies?.forEach((currency: IOption) => {
          switch (currency?.name) {
            case this._baseCurrencySource$.value?.name:
              this._baseCurrencySource$.next(currency);
              break;
            case this._targetCurrencySource$.value?.name:
              this._targetCurrencySource$.next(currency);
              break;
          }
        })
      })
    );

  constructor(
    private readonly _currencyService: CurrencyService
  ) {
    this.getCurrencies();
  }

  ngOnInit(): void {
    this.baseCurrency$
      .pipe(
        tap(r => console.log(r, this._loading$.value)),
        filter(() => !this._loading$.value),
        pairwise(),
        switchMap(([previousBaseCurrency, currentBaseCurrency]) => {

          if (
            previousBaseCurrency?.name === currentBaseCurrency?.name &&
            previousBaseCurrency?.value === currentBaseCurrency?.value
          ) {
            return of(currentBaseCurrency);
          }

          this._loading$.next(true)

          return this._currencyService.getPairConversion(
            currentBaseCurrency?.name,
            this._targetCurrencySource$.value?.name,
            currentBaseCurrency?.value,
          )
            .pipe(
              tap((result: Record<string, any>) => {
                this.onTargetAmountChange(
                  parseFloat(result?.['conversion_result']?.toFixed(2))
                );
                this._loading$.next(false);
              })
            );
        }),
        untilDestroyed(this)
      )
      .subscribe();

      this.targetCurrency$
        .pipe(
          filter(() => !this._loading$.value),
          pairwise(),
          switchMap(([previousTargetCurrency, currentTargetCurrency]) => {

            if (
              previousTargetCurrency?.name === currentTargetCurrency?.name &&
              previousTargetCurrency?.value === currentTargetCurrency?.value
            ) {
              return of(currentTargetCurrency);
            }

            this._loading$.next(true)

            return this._currencyService.getPairConversion(
              currentTargetCurrency?.name,
              this._baseCurrencySource$.value?.name,
              currentTargetCurrency?.value,
            )
              .pipe(
                tap((result: Record<string, any>) => {
                  this.onBaseAmountChange(
                    parseFloat(result?.['conversion_result']?.toFixed(2))
                  );
                  this._loading$.next(false);
                })
              );
          }),
          untilDestroyed(this)
        )
        .subscribe();
  }

  onBaseAmountChange(value: number) {
    this._baseCurrencySource$.next({
      name: this._baseCurrencySource$.value?.name,
      value
    });
  }

  onTargetAmountChange(value: number) {
    this._targetCurrencySource$.next({
      name: this._targetCurrencySource$.value?.name,
      value
    });
  }

  onBaseCurrencyChange(currency: IOption) {
    this._baseCurrencySource$.next({
      value: this._baseCurrencySource$.value?.value,
      name: currency?.name
    });
  }

  onTargetCurrencyChange(currency: IOption) {
    this._targetCurrencySource$.next({
      value: this._targetCurrencySource$.value?.value,
      name: currency?.name
    });
  }

  getCurrencies() {
    this._currencyService.getCurrenciesByBase()
      .pipe(
        take(1),
        untilDestroyed(this)
      )
      .subscribe()
  }
}