import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {
  loaderProg: number = 0;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private modalCtl: MatDialog) { }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.data.subscribe(arg => {
      this.loaderProgress(arg)
    });
  }

  loaderProgress(dataProg) {
    if (dataProg) {
      this.playLoaderAnimation();

    } else {

    }
  }

  playLoaderAnimation() {
    this.loaderProg++;
    if (this.loaderProg < 100) {

      setTimeout(() => {
        this.playLoaderAnimation();
      }, 50);
    } else {
      this.modalCtl.closeAll();
    }
  }
}
