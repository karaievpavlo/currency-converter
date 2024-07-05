import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MainComponent } from "./main.component";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { InputNumberModule } from 'primeng/inputnumber';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    FormsModule,
    InputNumberModule
  ],
  declarations: [
    MainComponent
  ],
  exports: [
    MainComponent
  ]
})

export class MainModule {}