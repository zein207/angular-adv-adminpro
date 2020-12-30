import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Usuario } from 'src/app/models/usuario.model';

import { BusquedasService } from 'src/app/services/busquedas.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: [
  ]
})
export class UsuariosComponent implements OnInit, OnDestroy {

  public totalUsuarios: number = 0;
  public usuarios: Usuario[] = [];
  public usuariosTemp: Usuario[] = [];
  
  public imgSubs: Subscription;
  public desde: number = 0;
  public cargando: boolean = true;

  constructor(private usuarioService: UsuarioService,
              private busquedasService: BusquedasService,
              private ModalImagenService: ModalImagenService) { }

  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {

    this.cargarUsuarios();

    this.imgSubs = this.ModalImagenService.nuevaImagen
        .pipe(
          delay(100)
        )
        .subscribe( img => {
          this.cargarUsuarios()
        });
  }

  cargarUsuarios(){
    this.cargando = true;
    this.usuarioService.cargarUsuarios( this.desde )
    .subscribe( ({total, usuarios}) => {
      this.totalUsuarios = total;
      this.usuarios = usuarios;
      this.usuariosTemp = usuarios;
      this.cargando = false;
    })
  }

  cambiarPagina( valor: number ) {
    this.desde += valor;

    if( this.desde < 0) {
      this.desde = 0;
    } else if ( this.desde >= this.totalUsuarios) {
      this.desde -= valor; 
    }

    this.cargarUsuarios();
  }

  buscar( termino: string) {

    if (termino.length === 0) {
      return this.usuarios = this.usuariosTemp;
    }
    this.busquedasService.buscar('usuarios', termino)
        .subscribe( resultados => {
          this.usuarios = resultados;
        })
  }

  eliminarUsuario( usuario: Usuario ) {

    if(usuario.uid === this.usuarioService.usuario.uid){
      return Swal.fire('Error', 'No puedes borrarte a ti mismo', 'error');
    }

    console.log(usuario)
    Swal.fire({
      title: 'Borrar usuario',
      text: `Estas a punto de borrar a ${usuario.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {

      if (result.isConfirmed) {
        this.usuarioService.eliminarUsuario( usuario )
            .subscribe( resp => {

              this.cargarUsuarios()
              Swal.fire(
                'Usuario borrado',
                `El usuario ${usuario.nombre} ha sido eliminado correctamente`,
                'success'
              )

              
            })
      }
    })
  }

  cambiarRole( usuario: Usuario ) {
    this.usuarioService.guardarUsuario(usuario)
        .subscribe( resp => {
          console.log(resp)
        })
  }

  abrirModal( usuario: Usuario) {
    this.ModalImagenService.abrirModal('usuarios', usuario.uid, usuario.img);
  }

}
