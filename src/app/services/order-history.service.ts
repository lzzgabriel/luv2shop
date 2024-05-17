import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private orderUrl = environment.luv2shopApiUrl + '/orders'

  constructor(private httpClient: HttpClient) { }

  getOrderHistory(email: String): Observable<GetResponseOrderHistory> {
    const url = `${this.orderUrl}/search/findByCustomerEmail?email=${email}`

    return this.httpClient.get<GetResponseOrderHistory>(url)
  }
}

interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[]
  }
}
