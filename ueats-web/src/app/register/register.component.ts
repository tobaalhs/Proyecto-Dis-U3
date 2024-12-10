import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface UrlConfig {
  urls: {
    'backend-identity': string;
    [key: string]: string;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  email: string = '';
  password: string = '';
  name: string = '';
  phone: string = '';
  street: string = '';
  city: string = '';
  private identityUrl: string = '';
  private headers = new HttpHeaders().set('ngrok-skip-browser-warning', 'true');

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    fetch('assets/links.json')
      .then(response => response.json())
      .then((config: UrlConfig) => {
        this.identityUrl = config.urls['backend-identity'];
      })
      .catch(error => console.error('Error cargando configuración:', error));
  }

  onRegister() {
    this.http.post<any>(
      `${this.identityUrl}/account/register`,
      {
        email: this.email,
        password: this.password,
        name: this.name,
        phone: this.phone,
        street: this.street,
        city: this.city
      },
      { headers: this.headers }
    ).subscribe(
      response => {
        this.router.navigate(['/']);
      },
      error => {
        alert('Registration failed');
      }
    );
  }
}