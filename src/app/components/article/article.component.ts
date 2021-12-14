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

  readMore: boolean[] = [];
  singleArticle: boolean = false;
  singleArticleData: any;
  backButtonBySingleArticle: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private modalCtl: MatDialog) { }

  ngOnInit(): void {
    if (this.data) {
      this.data.forEach(() => {
        const bool = true;
        this.readMore.push(bool);
      });

      if (this.data.length > 1) {
        this.singleArticle = false;
        this.backButtonBySingleArticle = true;
      } else if (this.data.length === 1) {
        this.singleArticle = true;
        this.singleArticleData = this.data[0];
        this.backButtonBySingleArticle = false;
      }
    }
  }

  closeArticle() {
    this.modalCtl.closeAll();
  }

  showText(indexOfelement) {
    this.readMore[indexOfelement] = !this.readMore[indexOfelement];
  }

  openSingleArticle(article) {
    let content = document.getElementById('content');
    content!.scrollTop = 0;
    this.singleArticle = true;
    this.singleArticleData = article;
  }

  backArticle() {
    this.singleArticle = false;
  }

}