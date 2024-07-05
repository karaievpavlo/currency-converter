import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HeaderModule } from './components/header/header.module';
import { MainModule } from './components/main/main.module';
import { environment } from 'src/environments/environment';
import { Environment } from './models/environment.model';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyService } from './services/currency.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HeaderModule,
    MainModule,
    BrowserAnimationsModule
  ],
  providers: [
    CurrencyService,
    {
      provide: Environment, 
      useValue: environment
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
