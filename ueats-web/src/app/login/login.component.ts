import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  private identityUrl: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    fetch('assets/links.json')
      .then(response => response.json())
      .then(data => {
        this.identityUrl = data.urls['backend-identity'];
        console.log('URL de identity cargada:', this.identityUrl);
      })
      .catch(error => console.error('Error cargando links:', error));
  }

  onLogin() {
    if (!this.identityUrl) {
      console.error('URL de identity no disponible');
      return;
    }

    this.http.post<any>(
      `${this.identityUrl}/account/login`, 
      { email: this.email, password: this.password },
      { headers: new HttpHeaders().set('ngrok-skip-browser-warning', 'true') }
    ).subscribe(
      response => {
        if (response.accountId) {
          localStorage.setItem('accountId', response.accountId.toString());
          this.http.get<any>(
            `${this.identityUrl}/profile?accountId=${response.accountId}`,
            { headers: new HttpHeaders().set('ngrok-skip-browser-warning', 'true') }
          ).subscribe(
            profileResponse => {
              localStorage.setItem('userName', profileResponse.name);
              localStorage.setItem('userCity', profileResponse.city);
              this.router.navigate(['/catalog']);
            },
            error => {
              console.error('Error fetching profile:', error);
              alert('Failed to fetch user profile');
            }
          );
        } else {
          alert('Account not found');
        }
      },
      error => {
        console.error('Login error:', error);
        alert('Login failed: ' + (error.error?.message || 'Usuario no encontrador, registrate'));
      }
    );
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}