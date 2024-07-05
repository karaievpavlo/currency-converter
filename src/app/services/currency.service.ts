import { Injectable } from "@angular/core";
import { Environment } from "../models/environment.model";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, of, tap } from "rxjs";
import { IOption } from "../models/option.interface";

@Injectable()
export class CurrencyService {
  private readonly _currenciesSource$ = new BehaviorSubject<any>(undefined);
  public readonly currencies$ = this._currenciesSource$.asObservable();
  
  constructor(
    private readonly environment: Environment,
    private readonly http: HttpClient
  ) {

  }

  getCurrenciesByBase(
    baseCurrency: string = 'USD'
  ) {
    return this.http.get(`${this.environment.apiUrl}/latest/${baseCurrency}`)
      .pipe(
        tap((response: Record<string, any>) => {
          this._currenciesSource$.next(
            Object
            ?.entries<number>(response?.['conversion_rates'])
            ?.map(([key, value]) => {
              const option: IOption = {
                name: key,
                value: parseFloat(value?.toFixed(2))
              };

              return option;
            })
          )
        })
      );
  }

  getPairConversion(
    baseCurrency: string | undefined,
    targetCurrency: string | undefined,
    amount: number | undefined | null
  ) {
    if (!baseCurrency || !targetCurrency || !amount) {
      return of({});
    }

    return this.http.get(`${this.environment.apiUrl}/pair/${baseCurrency}/${targetCurrency}/${amount}`);
  }
}