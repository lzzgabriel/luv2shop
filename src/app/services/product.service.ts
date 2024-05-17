import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = environment.luv2shopApiUrl + '/products';
  private categoryUrl = environment.luv2shopApiUrl + '/product-category';

  constructor(private httpClient: HttpClient) { }

  getProductList(categoryId: number): Observable<Product[]> {
    const url = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`;

    return this.callApi(url);
  }

  getProductListPaginate(categoryId: number, page:number, pageSize: number): Observable<GetResponseProducts> {
    const url = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}&page=${page}&size=${pageSize}`;

    return this.httpClient.get<GetResponseProducts>(url);
  }

  getProduct(id: number): Observable<Product> {
    const url = `${this.baseUrl}/${id}`;

    return this.httpClient.get<Product>(url);
  }

  private callApi(url: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(url).pipe(
      map(response => response._embedded.products)
    );
  }

  searchProducts(keyword: string): Observable<Product[]> {
    const url = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;

    return this.callApi(url);
  }

  searchProductsPaginate(keyword: string, page:number, pageSize: number): Observable<GetResponseProducts> {
    const url = `${this.baseUrl}/search/findByNameContaining?name=${keyword}&page=${page}&size=${pageSize}`;

    return this.httpClient.get<GetResponseProducts>(url);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    const url = this.categoryUrl;
    return this.httpClient.get<GetResponseProductCategory>(url).pipe(
      map(response => response._embedded.productCategory)
    );
  }

}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}
