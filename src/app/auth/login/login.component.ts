import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2'
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

declare const gapi: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.css']
})

export class LoginComponent implements OnInit{

  public formSubmitted = false;
  public auth2: any;

  public loginForm = this.fb.group({
    email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false]
  });


  constructor( private router: Router,
               private fb: FormBuilder,
               private usuarioservice: UsuarioService,
               private ngZone: NgZone) { }

  ngOnInit(): void {
    this.renderButton();
  }

  login() {

    this.usuarioservice.login( this.loginForm.value )
        .subscribe( resp => {

          if ( this.loginForm.get('remember').value) {
            localStorage.setItem('email', this.loginForm.get('email').value);
          } else {
            localStorage.removeItem('email');
          }

          //Navegar al dashboard
          this.router.navigateByUrl('/');

        }, (err) => {
          //Si sucede un error
          Swal.fire('Error', err.error.message, 'error');
        });

  }
  

  renderButton() {
    gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
    });

    this.startApp();
  }

  async startApp() {
      await this.usuarioservice.googleInit();
      this.auth2 = this.usuarioservice.auth2;
      this.attachSignin(document.getElementById('my-signin2'));
  };

  attachSignin(element) {

    this.auth2.attachClickHandler(element, {},
        (googleUser) => {
          const id_token = googleUser.getAuthResponse().id_token;
          //console.log(id_token);
          this.usuarioservice.loginGoogle( id_token )
              .subscribe( resp => {
                //Navegar al dashboard
                this.ngZone.run( () => {
                  this.router.navigateByUrl('/');
                })
              });

        }, (error) => {
            alert(JSON.stringify(error, undefined, 2));
        });
  }

}
