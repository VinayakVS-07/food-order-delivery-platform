import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usernameKey = 'username';
  private apiUrl = 'https://localhost:7229/api/Users';

  userUpdated = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
  }


  //  Login user and save JWT token
  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      Email: email,
      Password: password,

    };

    return this.http.post(`${this.apiUrl}/login`, body, { headers }).pipe(
      tap((res: any) => {
        if (res.success && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res));
        }
      })
    );
  }

  // Register new user
  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // --- My Account ---
  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetUserByID/${userId}`);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/UpdateUser/${user.userID}`, user);
  }

  // --- Change Password ---
  changePassword(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChangePassword`, payload);
  }

  getAllRestaurants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/restaurants`);
  }

  getMenuItemsByRestaurant(restaurantId: number): Observable<any[]> {
    const role = this.getUserRole();
    return this.http.get<any[]>(`${this.apiUrl}/menuitems/${restaurantId}?role=${role}`);
  }


  getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  getRestaurantsByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-category/${category}`);
  }

  search(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?term=${term}`);
  }

  saveUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }


  addToCart(payload: any) {
    return this.http.post(`${this.apiUrl}/addCart`, payload);
  }

  getCartItems(customerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cart/${customerId}`);
  }

  updateCartItem(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updatecart`, payload);
  }

  removeCartItem(cartId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/removecart/${cartId}`);
  }

  clearCart(customerId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clearcart/${customerId}`);
  }

  getCartItemCount(userId: number): Observable<number> {
    return this.http.get<{ totalQuantity: number }>(`${this.apiUrl}/count/${userId}`)
      .pipe(
        map(res => res.totalQuantity)
      );
  }

  // --- Payout ---

  placeOrder(payload: any) {
    return this.http.post(`${this.apiUrl}/place-order`, payload);
  }

  // --- Customer Address ---

  getCustomerAddresses(customerId: number) {
    return this.http.get(`${this.apiUrl}/getaddress${customerId}`);
  }


  addCustomerAddress(address: any) {
    return this.http.post(`${this.apiUrl}/addaddress`, address);
  }

  // --- My Orders ---

  getCustomerOrders(customerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${customerId}`);
  }

  // Get admin dashboard stats
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboardstats`);
  }

  // Get recent orders
  getRecentOrders(topN: number = 5): Observable<any> {
    return this.http.get(`${this.apiUrl}/recent-orders?topN=${topN}`);
  }

  // ✅ Get all orders
  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all-orders`);
  }

  // ✅ Update order status
  updateOrderStatus(orderId: number, newStatus: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-status/${orderId}`, `"${newStatus}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


  //  Get all riders
  getAllRiders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all-riders`);
  }

  //  Assign rider to an order
  updateRider(orderId: number, riderId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/assign-rider/${orderId}`, riderId);
  }

  // Get rider dashboard 
  getRiderDashboard(riderId: number) {
    return this.http.get<any>(`${this.apiUrl}/dashboard/${riderId}`);
  }

  updateRiderStatus(riderId: number, isOnline: boolean) {
    const payload = { riderID: riderId, isOnline: isOnline };
    return this.http.put<any>(`${this.apiUrl}/update-online-status`, payload);
  }



  getRiderLiveOrders(riderId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rider-live-orders/${riderId}`);
  }

  getRiderLiveOrderCount(riderId: number) {
    return this.http.get<any>(`${this.apiUrl}/rider-liveorder-count/${riderId}`);
  }


  // Rider get order detail
  getRiderOrderDetails(riderId: number, orderId: number) {
    return this.http.get<any>(`${this.apiUrl}/rider-order-details/${riderId}/${orderId}`);
  }

  // Update order status
  updateRiderOrderStatus(orderId: number, riderId: number, newStatus: string) {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/update-rider-order-status`,
      {
        orderID: orderId,
        riderID: riderId,
        newStatus: newStatus
      }
    );
  }
  // Get rider order history
  getRiderOrderHistory(riderId: number) {
    return this.http.get<{ success: boolean; data: any[] }>(
      `${this.apiUrl}/order-history/${riderId}`
    );
  }

  getRiders(filter: any) {
    return this.http.post<any>(`${this.apiUrl}/rider-list`, filter);
  }


  toggleRiderStatus(id: number, isActive: boolean) {
    return this.http.put<any>(`${this.apiUrl}/update-rider-status/${id}/active`, { isActive });
  }

  getPendingRiders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pending-riders`);
  }

  approveRider(userId: number, modifiedBy: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve-rider/${userId}`, { modifiedBy });
  }

  getPendingRestaurants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pending-restaurants`);
  }

  approveUser(userId: number, modifiedBy: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve-user/${userId}`, { modifiedBy });
  }

  // Get restaurant dashboard 
  getRestaurantDashboard(restaurantId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/restaurant-dashboard/${restaurantId}`);
  }

  getRestaurantByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-restaurant-by-user/${userId}`);
  }


  getRestaurantByOwner(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-user/${userId}`);
  }

  addRestaurant(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-restaurant`, data);
  }


  updateRestaurant(restaurantData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/update-restaurant`, restaurantData);
  }

  toggleRestaurantOpen(restaurantId: number, body: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/toggle-open/${restaurantId}`, body);
  }

  getMenuItemById(menuItemId: number) {
    return this.http.get<any>(`${this.apiUrl}/menu-item/${menuItemId}`);
  }

  updateMenuItem(payload: any) {
    return this.http.put<any>(`${this.apiUrl}/update-item`, payload);
  }

  addMenuItem(menuItem: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-menu-item`, menuItem);
  }

  getLiveOrdersForRestaurant(restaurantId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/live-orders/${restaurantId}`);
  }

  updateOrderStatusbyRestaurant(orderId: number, newStatus: string, modifiedBy: string) {
    return this.http.post<any>(`${this.apiUrl}/update-status`, { orderID: orderId, orderStatus: newStatus, modifiedBy });
  }

  getRestaurantOrderHistory(restaurantId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/restaurant-order-history/${restaurantId}`);
  }

  // ✅ Get all menu items with restaurant info
  getAllMenuItems() {
    return this.http.get<any[]>(`${this.apiUrl}/all-menuitems`);
  }

  getAdminActiveOrderCount() {
    return this.http.get<any>(`${this.apiUrl}/active-orders-count-admin`);
  }

  getRestaurantLiveOrderCount(restaurantId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/active-orders-count/${restaurantId}`);
  }


  getCategoriesWithImages(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories-img`);
  }

  uploadProfilePicture(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ success: boolean; data: { profileImagePath: string } }>(
      `${this.apiUrl}/upload-profile-picture/${userId}`,
      formData
    );
  }

  // Image preview
  // 🔹 Get API base URL 
  getApiBaseUrl(): string {
    const index = this.apiUrl.indexOf('/api');
    return index >= 0 ? this.apiUrl.substring(0, index) : this.apiUrl;
  }

  // 🔹 Build full image URL from relative path (/profile-pictures/xxx.jpg)
  buildImageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${this.getApiBaseUrl()}${path}`;
  }

  // 🔹 Convenience: directly from a user object
  getUserProfileImageUrl(user: any): string | null {
    if (!user) return null;
    return this.buildImageUrl(user.profileImagePath);
  }

  // ===== Send OTP =====
  sendOtp(email: string) {
    return this.http.post<any>(`${this.apiUrl}/send-otp`, { email });
  }

  // ===== Verify OTP =====
  verifyOtp(email: string, otpCode: string) {
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, { email, otpCode });
  }

  // ===== AIChat =====
  askAI(message: string) {
    return this.http.post<any>(`${this.apiUrl}/ask`, { message });
  }









  // ✅ Save token to local storage
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  // ✅ Get token from local storage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Get user from local storage
  getUser(): any {
    const user = localStorage.getItem('user');
    if (!user) return null;

    const parsed = JSON.parse(user);

    // Map backend's UserID to userId
    return {
      ...parsed,
      userId: parsed.userId || parsed.userID || parsed.UserID || parsed.ID
    };
  }

  getUserRole(): string | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.roleName || null;
  }



  // ✅ Check if logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ Logout and clear data
  logout(): void {
    const user = this.getUser();
  if (user) {
    localStorage.removeItem(`aiChatHistory_${user.userId}`);
  }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
