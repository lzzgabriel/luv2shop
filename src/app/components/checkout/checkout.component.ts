import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Luv2ShopFormService } from '../../services/luv2-shop-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { Luv2ShopValidators } from '../../validators/luv2-shop-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { environment } from '../../../environments/environment.development';
import { PaymentInfo } from '../../common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creaditCardYears: number[] = [];
  creaditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingStates: State[] = [];
  billingStates: State[] = [];

  storage: Storage = sessionStorage

  stripe = Stripe(environment.stripePublishableKey)

  paymentInfo: PaymentInfo = new PaymentInfo()
  cardElement: any
  displayError: any

  constructor(private formBuilder: FormBuilder,
    private luv2ShopFormService: Luv2ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }

  ngOnInit(): void {

    this.setupStripePaymentForm()

    this.reviewCartDetails();

    let userEmail
    try {
      userEmail = JSON.parse(this.storage.getItem('user_email') ?? '')
    } catch (error) {
      userEmail = ''
    }

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl(userEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
      }),
    });

    const startMonth = new Date().getMonth() + 1;

    this.luv2ShopFormService.getCountries().subscribe(
      data => this.countries = data
    );
  }

  setupStripePaymentForm() {
    let elements = this.stripe.elements()

    this.cardElement = elements.create('card', { hidePostalCode: true })

    this.cardElement.mount('#card-element')

    this.cardElement.on('change', (event: any) => {
      this.displayError = document.getElementById('card-errors')

      if (event.complete)
        this.displayError.textContent = ''
      else if (event.error)
        this.displayError.textContent = event.error.message
    })
  }

  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );
  }

  get firstName() {return this.checkoutFormGroup.get('customer.firstName')};
  get lastName() {return this.checkoutFormGroup.get('customer.lastName')};
  get email() {return this.checkoutFormGroup.get('customer.email')};

  get shippingStreet() {return this.checkoutFormGroup.get('shippingAddress.street')}
  get shippingCity() {return this.checkoutFormGroup.get('shippingAddress.city')}
  get shippingState() {return this.checkoutFormGroup.get('shippingAddress.state')}
  get shippingCountry() {return this.checkoutFormGroup.get('shippingAddress.country')}
  get shippingZipCode() {return this.checkoutFormGroup.get('shippingAddress.zipCode')}

  get billingStreet() {return this.checkoutFormGroup.get('billingAddress.street')}
  get billingCity() {return this.checkoutFormGroup.get('billingAddress.city')}
  get billingState() {return this.checkoutFormGroup.get('billingAddress.state')}
  get billingCountry() {return this.checkoutFormGroup.get('billingAddress.country')}
  get billingZipCode() {return this.checkoutFormGroup.get('billingAddress.zipCode')}

  /*
  get cardType() {return this.checkoutFormGroup.get('creditCard.cardType')}
  get nameOnCard() {return this.checkoutFormGroup.get('creditCard.nameOnCard')}
  get cardNumber() {return this.checkoutFormGroup.get('creditCard.cardNumber')}
  get securityCode() {return this.checkoutFormGroup.get('creditCard.securityCode')}
  get expirationMonth() {return this.checkoutFormGroup.get('creditCard.expirationMonth')}
  get expirationYear() {return this.checkoutFormGroup.get('creditCard.expirationYear')}
  */

  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;

    let orderItems: OrderItem[] = cartItems.map(item => new OrderItem(item));

    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress?.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress?.country));
    purchase.shippingAddress!.state = shippingState.name;
    purchase.shippingAddress!.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress?.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress?.country));
    purchase.billingAddress!.state = billingState.name;
    purchase.billingAddress!.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = this.totalPrice * 100
    this.paymentInfo.currency = 'USD'

    // if valid form then
    // - create payment intent
    // - confirm card payment
    // - place order

    if (this.checkoutFormGroup.invalid && this.displayError.textContent === '') {
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        response => {
          this.stripe.confirmCardPayment(response.client_secret, {
            payment_method: {
              card: this.cardElement
            }
          }, { handleActions: false })
          .then((result: any) => {
            if (result.error)
              alert(`There was an error: ${result.error.message}`)
            else {
              this.checkoutService.placeOrder(purchase).subscribe({
                next: (res: any) => {
                  alert(`Your order has been received.\nOrder tracking number: ${res.orderTrackingNumber}`)
                  this.resetCart()
                },
                error: (err: any) => alert(`There was an error: ${err.message}`)
              })
            }
          })
        }
      )
    } else {
      this.checkoutFormGroup.markAllAsTouched()
      return
    }
    
  }

  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    
    this.checkoutFormGroup.reset();

    this.router.navigateByUrl('/products');

  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingStates = this.shippingStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear = new Date().getFullYear();
    const selectedYear = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;

    startMonth = (currentYear === selectedYear) ? (new Date().getMonth() + 1) : 1;

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => this.creaditCardMonths = data
    )
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const code = formGroup?.value.country.code;

    this.luv2ShopFormService.getStates(code).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingStates = data;
        } else {
          this.billingStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    )
  }

}
