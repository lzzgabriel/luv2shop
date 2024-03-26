import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'http://localhost:8080/api/products';
  private categoryUrl = 'http://localhost:8080/api/product-category';

  constructor(private httpClient: HttpClient) { }

  getProductList(categoryId: number): Observable<Product[]> {
    const url = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`;

    return this.callApi(url);
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
  }
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}