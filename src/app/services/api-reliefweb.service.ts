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
    const filter = '&filter[field]=date.created&filter[value][from]='+date+'T00:00:00%2B00:00&filter[value][to]='+date+'T23:59:59%2B00:00&limit=1';
    this.url = this.url + filter;
    return this.http.get(this.url, {responseType: "json"});
  }

}
