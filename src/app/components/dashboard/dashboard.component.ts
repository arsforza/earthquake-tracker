import { Component, OnInit, ViewChild } from '@angular/core';;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  platesFilter: boolean;

  constructor() {
    this.platesFilter = true;
  }

  ngOnInit(): void {
  }

}
