import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule,HTTP_INTERCEPTORS, withInterceptors, provideHttpClient } from '@angular/common/http';
import { authInterceptor } from './auth/interceptors/auth.interceptors-interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';




import { RouterModule } from '@angular/router';
import { routes } from './app-routing-module';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app.component';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { CustomerHome } from './pages/customer-home/customer-home';
import { MenuItems } from './pages/menu-items/menu-items';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { AddressboxDialog } from './pages/addressbox-dialog/addressbox-dialog';
import { PaymentConfirmDialog } from './pages/payment-confirm-dialog/payment-confirm-dialog';
import { MyOrders } from './pages/my-orders/my-orders';
import { CustomerHeader } from './shared/customer-header/customer-header';
import { MyAccount } from './pages/my-account/my-account';
import { ChangePasswordDialog } from './pages/change-password-dialog/change-password-dialog';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { AdminHeader } from './shared/admin-header/admin-header';
import { Restaurants } from './admin/restaurants/restaurants';
import { Orders } from './admin/orders/orders';
import { RiderDashboard } from './rider/rider-dashboard/rider-dashboard';
import { LiveOrders } from './rider/live-orders/live-orders';
import { OrderDetail } from './rider/order-detail/order-detail';
import { OrderHistory } from './rider/order-history/order-history';
import { Riders } from './admin/riders/riders';
import { ApproveRidersDialog } from './admin/approve-riders-dialog/approve-riders-dialog';
import { ApproveRestaurantsDialog } from './admin/approve-restaurants-dialog/approve-restaurants-dialog';
import { RestaurantDashboard } from './restaurant/restaurant-dashboard/restaurant-dashboard';
import { RestaurantProfile } from './restaurant/restaurant-profile/restaurant-profile';
import { LiveOrdersRestaurant } from './restaurant/live-orders-restaurant/live-orders-restaurant';
import { OrderHistoryRestaurant } from './restaurant/order-history-restaurant/order-history-restaurant';
import { AiChat } from './shared/ai-chat/ai-chat';


@NgModule({
  declarations: [
    App,
    Login,
    Register,
    CustomerHome,
    MenuItems,
    Cart,
    Checkout,
    AddressboxDialog,
    PaymentConfirmDialog,
    MyOrders,
    CustomerHeader,
    MyAccount,
    ChangePasswordDialog,
    AdminDashboard,
    AdminHeader,
    Restaurants,
    Orders,
    RiderDashboard,
    LiveOrders,
    OrderDetail,
    OrderHistory,
    Riders,
    ApproveRidersDialog,
    ApproveRestaurantsDialog,
    RestaurantDashboard,
    RestaurantProfile,
    LiveOrdersRestaurant,
    OrderHistoryRestaurant,
    AiChat,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatGridListModule,
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    FormsModule, 
    ReactiveFormsModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTooltip,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,


    RouterModule.forRoot(routes),
    AppRoutingModule
  ],
     providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: [App]
})
export class AppModule { }
