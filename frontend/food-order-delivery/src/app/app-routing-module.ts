import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard-guard';

import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { CustomerHome } from './pages/customer-home/customer-home';
import { MenuItems } from './pages/menu-items/menu-items';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { MyOrders } from './pages/my-orders/my-orders';
import { MyAccount } from './pages/my-account/my-account';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { Restaurants } from './admin/restaurants/restaurants';
import { Orders } from './admin/orders/orders';
import { RiderDashboard } from './rider/rider-dashboard/rider-dashboard';
import { LiveOrders } from './rider/live-orders/live-orders';
import { OrderDetail } from './rider/order-detail/order-detail';
import { OrderHistory } from './rider/order-history/order-history';
import { Riders } from './admin/riders/riders';
import { RestaurantDashboard } from './restaurant/restaurant-dashboard/restaurant-dashboard';
import { RestaurantProfile } from './restaurant/restaurant-profile/restaurant-profile';
import { LiveOrdersRestaurant } from './restaurant/live-orders-restaurant/live-orders-restaurant';
import { OrderHistoryRestaurant } from './restaurant/order-history-restaurant/order-history-restaurant';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'home', component: CustomerHome, canActivate: [AuthGuard] },
  { path: 'menu', component: MenuItems, canActivate: [AuthGuard] },
  { path: 'menu/:id', component: MenuItems, canActivate: [AuthGuard] },
  { path: 'cart', component: Cart, canActivate: [AuthGuard] },
  { path: 'cart/:id', component: Cart, canActivate: [AuthGuard] },
  { path: 'checkout', component: Checkout, canActivate: [AuthGuard] },
  { path: 'myorder', component: MyOrders, canActivate: [AuthGuard] },
  { path: 'myaccount', component: MyAccount, canActivate: [AuthGuard] },
  
  { path: 'admin-dashboard', component: AdminDashboard, canActivate: [AuthGuard] },
  { path: 'admin-restaurant',component:Restaurants , canActivate: [AuthGuard] },
  { path: 'all-orders',component:Orders , canActivate: [AuthGuard] },
    { path: 'admin-riders',component:Riders , canActivate: [AuthGuard] },
  
  { path: 'rider-dashboard',component:RiderDashboard , canActivate: [AuthGuard] },
  { path: 'live-orders',component:LiveOrders , canActivate: [AuthGuard] },
  { path: 'order-details/:orderId',component:OrderDetail , canActivate: [AuthGuard] },
  { path: 'order-history',component:OrderHistory , canActivate: [AuthGuard] },

  { path: 'restaurant-dashboard',component:RestaurantDashboard , canActivate: [AuthGuard] },
  { path: 'restaurant-profile',component:RestaurantProfile , canActivate: [AuthGuard] },
  { path: 'restaurant-live-order',component:LiveOrdersRestaurant , canActivate: [AuthGuard] },
  { path: 'restaurant-order-history',component:OrderHistoryRestaurant , canActivate: [AuthGuard] },
  


];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
