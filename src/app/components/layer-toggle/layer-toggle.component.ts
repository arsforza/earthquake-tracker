import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-layer-toggle',
  templateUrl: './layer-toggle.component.html',
  styleUrls: ['./layer-toggle.component.css']
})
export class LayerToggleComponent implements OnInit {
  @Input() labelText: string = '';
  @Input() actionText: string = '';

  @Output() onShowLayer: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  checkValue(event: any){
    const { checked } = event.target;
    this.onShowLayer.emit(checked);
  }
}
