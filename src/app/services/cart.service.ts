import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();

  constructor() { }

  addToCart(cartItem: CartItem) {
    let exists: boolean = false;
    let existing: CartItem | undefined;

    if (this.cartItems.length > 0) {
      for (let item of this.cartItems) {
        if (item.id === cartItem.id) {
          existing = item;
          break;
        }
      }

      exists = existing != undefined;
    }

    if (exists) {
      existing!.quantity++;
    } else {
      this.cartItems.push(cartItem);
    }

    this.computeCartTotals();
  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    this.cartItems.forEach((value) => {
      totalPriceValue += value.quantity * value.unitPrice;
      totalQuantityValue += value.quantity;
    });

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
  }
}
