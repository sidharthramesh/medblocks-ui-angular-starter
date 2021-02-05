import { Component } from '@angular/core';
import { webtemplate } from './bloodPressureTemplate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currentValue: any;

  title = 'my-app';
  settings = {
    template: webtemplate,
    configuration: {},
    readOnly: false
  }

  handleChange(e: CustomEvent){
    console.log("Change event:", {data: e.detail})
    this.currentValue = e.detail
  }

  handleDone(e: CustomEvent){
    console.log("Submit event:", {data: e.detail})
  }
}
