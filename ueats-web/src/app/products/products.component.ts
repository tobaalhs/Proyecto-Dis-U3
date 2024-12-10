import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface UrlConfig {
  urls: {
    'backend-catalog': string;
    'backend-orders': string;
    [key: string]: string;
  };
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  storeId: number = 0;
  products: Product[] = [];
  cartItems: CartItem[] = [];
  cartOpen: boolean = false;
  tempQuantities: { [key: number]: number } = {};
  private catalogUrl: string = '';
  private ordersUrl: string = '';
  private headers = new HttpHeaders().set('ngrok-skip-browser-warning', 'true');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    fetch('assets/links.json')
      .then(response => response.json())
      .then((config: UrlConfig) => {
        this.catalogUrl = config.urls['backend-catalog'];
        this.ordersUrl = config.urls['backend-orders'];
        
        const storedStoreId = localStorage.getItem('selectedStoreId');
        if (storedStoreId) {
          this.storeId = parseInt(storedStoreId, 10);
          this.getProductsByStore(this.storeId);
          this.loadCart();
        } else {
          console.error('No store ID found in localStorage.');
        }
      })
      .catch(error => console.error('Error cargando configuración:', error));
  }

  getProductsByStore(storeId: number): void {
    this.http.get<Product[]>(`${this.catalogUrl}/product?storeId=${storeId}`, { headers: this.headers }).subscribe(
      response => {
        this.products = response;
        this.products.forEach(product => {
          this.tempQuantities[product.id] = 1;
        });
      },
      error => {
        console.error('Error al obtener los productos:', error);
      }
    );
  }

  increaseQuantity(product: Product): void {
    if (!this.tempQuantities[product.id]) {
      this.tempQuantities[product.id] = 1;
    }
    this.tempQuantities[product.id]++;
  }

  decreaseQuantity(product: Product): void {
    if (this.tempQuantities[product.id] > 1) {
      this.tempQuantities[product.id]--;
    }
  }

  getProductQuantity(product: Product): number {
    return this.tempQuantities[product.id] || 1;
  }

  addToCart(product: Product): void {
    const quantity = this.tempQuantities[product.id] || 1;
    const existingItem = this.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        ...product,
        quantity: quantity
      });
    }
    
    this.tempQuantities[product.id] = 1;
    this.saveCart();

    const cartButton = document.querySelector('.cart-button');
    cartButton?.classList.add('cart-bump');
    setTimeout(() => {
      cartButton?.classList.remove('cart-bump');
    }, 300);
  }

  removeFromCart(item: CartItem): void {
    const index = this.cartItems.findIndex(cartItem => cartItem.id === item.id);
    if (index > -1) {
      if (this.cartItems[index].quantity > 1) {
        this.cartItems[index].quantity--;
      } else {
        this.cartItems.splice(index, 1);
      }
      this.saveCart();
    }
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  closeCart(): void {
    this.cartOpen = false;
  }

  clearCart(): void {
    this.cartItems = [];
    localStorage.removeItem('cart');
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify({
      storeId: this.storeId,
      items: this.cartItems
    }));
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      if (cart.storeId === this.storeId) {
        this.cartItems = cart.items;
      }
    }
  }

  placeOrder(): void {
    const accountId = localStorage.getItem('accountId');
    if (!accountId) {
      alert('Debe iniciar sesión para realizar un pedido');
      return;
    }
  
    if (this.cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }
  
    const orderData = {
      accountId: parseInt(accountId),
      products: this.cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };
  
    this.http.post(`${this.ordersUrl}/order`, orderData, { headers: this.headers }).subscribe(
      response => {
        alert('Pedido realizado con éxito');
        this.clearCart();
        this.closeCart();
      },
      error => {
        console.error('Error al realizar el pedido:', error);
        alert('Error al realizar el pedido: ' + (error.error?.message || 'Error desconocido'));
      }
    );
  }

  goBack() {
    this.router.navigate(['/catalog']);
  }
}