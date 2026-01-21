import { Component,OnInit ,AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit, AfterViewInit {
  stats: any = {};
  recentOrders: any[] = [];
  isLoading = true;

  @ViewChild('ordersChart') ordersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('earningsChart') earningsChartRef!: ElementRef<HTMLCanvasElement>;

  private ordersChart!: Chart;
  private earningsChart!: Chart;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    const check = setInterval(() => {
      if (this.stats && Object.keys(this.stats).length) {
        
        clearInterval(check);
      }
    }, 300);
  }

  loadDashboard(): void {
    this.authService.getAdminStats().subscribe({
      next: (res) => {
        this.stats = res || {};
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });

    this.authService.getRecentOrders(5).subscribe({
      next: (res) => (this.recentOrders = res || []),
      error: () => {},
    });
  }

 
}