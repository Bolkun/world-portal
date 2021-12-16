import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  social_url = location.origin + '/dashboard';

  readMore: boolean[] = [];
  singleArticle: boolean = false;
  singleArticleData: any;
  backButtonBySingleArticle: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private modalCtl: MatDialog,
              public userService: UserService) { }

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

  async saveComment(articleID, comment){
    await this.userService.SaveComment(articleID, comment);
  }

}