import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import{ Test } from '/test/test.module' import{ Test } from '/test/test.module' import{ Test } from '/test/test.module' 




@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  , TestModule]
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
