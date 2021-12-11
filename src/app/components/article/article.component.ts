import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  social_url = location.origin + '/dashboard';
  commentMockUps = [
    {
      name: 'Hamedkabir',
      comment: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam',
      createdAt: '03.12.2021'
    }
    ,
    {
      name: 'Hamedkabir',
      comment: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam',
      createdAt: '03.12.2021'
    },
    {
      name: 'Hamedkabir',
      comment: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam',
      createdAt: '03.12.2021'
    }
  ]
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private modalCtl: MatDialog) { }

  ngOnInit(): void { }

  closeArticle() {
    this.modalCtl.closeAll();
  }

}