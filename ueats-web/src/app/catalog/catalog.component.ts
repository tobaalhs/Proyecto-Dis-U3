import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

interface Store {
  id: number;
  name: string;
  category: string;
  image: string;
  rating: number;
  city: string;
}

interface Rating {
  rating: number;
  comment: string;
  createdAt: string;
}

interface RatingResponse {
  averageRating: number;
  ratings: Rating[];
}

interface UrlConfig {
  urls: {
    'backend-catalog': string;
    'backend-rating': string;
    [key: string]: string;
  };
}

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe],
})
export class CatalogComponent implements OnInit {
  stores: Store[] = [];
  userCity: string = '';
  selectedStoreReviews: any = null;
  private catalogUrl: string = '';
  private ratingUrl: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.userCity = localStorage.getItem('userCity') || '';
    
    fetch('assets/links.json')
      .then(response => response.json())
      .then((config: UrlConfig) => {
        this.catalogUrl = config.urls['backend-catalog'];
        this.ratingUrl = config.urls['backend-rating'];
        this.loadStores();
      })
      .catch(error => console.error('Error cargando configuración:', error));
  }

  loadStores() {
    this.http.get<Store[]>(`${this.catalogUrl}/store?city=${this.userCity}`, { headers: new HttpHeaders().set('ngrok-skip-browser-warning', 'true') }).subscribe(
      stores => {
        stores.forEach(store => {
          this.loadStoreRating(store);
        });
        this.stores = stores;
      },
      error => console.error('Error loading stores:', error)
    );
  }

  loadStoreRating(store: Store) {
    this.http.get<RatingResponse>(`${this.ratingUrl}/rating?storeId=${store.id}`, { headers: new HttpHeaders().set('ngrok-skip-browser-warning', 'true') }).subscribe(
      response => {
        store.rating = response.averageRating;
      },
      error => {
        console.error('Error loading store rating:', error);
        store.rating = 0;
      }
    );
  }

  showReviews(store: Store) {
    this.http.get<RatingResponse>(`${this.ratingUrl}/rating?storeId=${store.id}`, { headers: new HttpHeaders().set('ngrok-skip-browser-warning', 'true') }).subscribe(
      response => {
        this.selectedStoreReviews = {
          ...response,
          storeName: store.name
        };
      },
      error => {
        console.error('Error loading reviews:', error);
        alert('Error al cargar las reseñas');
      }
    );
  }

  closeReviews() {
    this.selectedStoreReviews = null;
  }

  selectStore(store: Store) {
    localStorage.setItem('selectedStoreId', store.id.toString());
    this.router.navigate(['/products']);
  }
}