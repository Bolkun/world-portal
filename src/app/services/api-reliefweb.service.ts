import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiReliefwebService {
  url: string = 'https://api.reliefweb.int/v1/reports?appname=apidoc&profile=full';
  data: any;

  constructor(
    private http: HttpClient
  ) {}

  getDisastersByDate(date: string) {
    if(date == this.getCurrentDate()) {
      // current disasters
      this.url = "https://api.reliefweb.int/v1/disasters?appname=rwint-user-0&profile=full&preset=latest&slim=1&limit=1000";
    } else {
      // articles from past
      // https://api.reliefweb.int/v1/reports?appname=apidoc&profile=full&filter[field]=date.created&filter[value][from]=2021-12-02T00:00:00%2B00:00&filter[value][to]=2021-12-02T23:59:59%2B00:00&limit=1000
      const filter = '&filter[field]=date.created&filter[value][from]='+date+'T00:00:00%2B00:00&filter[value][to]='+date+'T23:59:59%2B00:00&limit=1000';
      this.url = this.url + filter;
    }
    //console.log(this.url);
    return this.http.get(this.url, {responseType: "json"});
  }

  public getCurrentDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    var yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
  }

}
