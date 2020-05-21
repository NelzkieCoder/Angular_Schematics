import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'hello-<%= dasherize(name) %>-component',
  template:`
    <h1> Hello there <%= dasherize(name) %> </h1>
  `
})
export class Hello<%= classify(name) %>Component{
  <% if(true) { %> let sample = "awesome"; <% } %>
}
