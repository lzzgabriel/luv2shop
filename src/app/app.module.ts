import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductService } from './services/product.service';
import { Router, RouterModule, Routes } from '@angular/router';
import { ProductCategoryMenuComponent } from './components/product-category-menu/product-category-menu.component';
import { SearchComponent } from './components/search/search.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CartStatusComponent } from './components/cart-status/cart-status.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginStatusComponent } from './components/login-status/login-status.component';
import myAppConfig from './config/my-app-config';
import { AuthGuard, AuthService, provideAuth0 } from '@auth0/auth0-angular';
import { MembersPageComponent } from './components/members-page/members-page.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';

const oktaConfig = myAppConfig.oidc;

function sendToLoginPage(auth: AuthService) {
  auth.loginWithRedirect();
}

const routes: Routes = [
  {path: 'order-history', component: OrderHistoryComponent, canActivate: [AuthGuard], data: {onAuthRequired: sendToLoginPage}},
  {path: 'members', component: MembersPageComponent, canActivate: [AuthGuard], data: {onAuthRequired: sendToLoginPage}},
  {path: 'checkout', component: CheckoutComponent},
  {path: 'cart-details', component: CartDetailsComponent},
  {path: 'products/:id', component: ProductDetailsComponent},
  {path: 'search/:keyword', component: ProductListComponent},
  {path: 'category/:id', component: ProductListComponent},
  {path: 'category', component: ProductListComponent},
  {path: 'products', component: ProductListComponent},
  {path: '', redirectTo: '/products', pathMatch: 'full'},
  {path: '**', redirectTo: '/products', pathMatch: 'full'},
];

@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductCategoryMenuComponent,
    SearchComponent,
    ProductDetailsComponent,
    CartStatusComponent,
    CartDetailsComponent,
    CheckoutComponent,
    LoginStatusComponent,
    MembersPageComponent,
    OrderHistoryComponent
  ],
  imports: [
    RouterModule.forRoot(routes),
    BrowserModule,
    HttpClientModule,
    NgbModule,
    ReactiveFormsModule,
  ],
  providers: [
    ProductService,
    provideAuth0({
      domain: 'dev-vr0w2p03cxvafq4d.us.auth0.com',
      clientId: 'Is3r0zMqMKEqktcIQJoFtFQEcMonwu1j',
      authorizationParams: {
        redirect_uri: window.location.origin
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
