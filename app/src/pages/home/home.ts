import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ToastController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  imagemUrl:string="assets/imgs/plantafeliz.jpg";
  statusPlanta:string="Planta Feliz";
  descricaoPlanta:string="Tudo certo com sua planta, ela está muito bem irrigada e feliz!";

  constructor(public navCtrl: NavController, private http: HttpClient, private toastCtrl: ToastController) {
    setInterval(() => {

      const config = 'assets/config.json';
      const getConfig = this.http.get<any>(config);

      getConfig.subscribe(c => {
          console.log('Get status from API', c.api);
          const getStatus = this.http.get<any>(c.api);

          getStatus
            .subscribe((data) => {              
              console.log('Response', data);
              if (data && data.status) {                
                
                const info = this.presentMessage("Recebendo atualização de status...");
                info.then(() => {
                  switch(data.status) { 
                    case 1: {
                      this.atualizarFlor1();
                        break; 
                    } case 2: { 
                        this.atualizarFlor2();
                        break;
                    } case 3: { 
                      this.atualizarFlor3();
                      break; 
                    } default: { 
                      this.presentMessage("Não foi possível se comunicar com a API Smart Garden");
                      break; 
                    }
                  }
                });                
            } else {
              this.presentMessage("Não foi possível se comunicar com a API Smart Garden", 5000);
            }
        }, (err) => {
          console.log("Response Error", err.error);
          let msg = `Erro ao comunicar com a API Smart Garden`;
          if (err.error) {
            msg += `: ${err.error.msg}.`;
          }
          this.presentMessage(msg, 5000);
        });
      });
    }, 60000); // 1 em 1 minuto
  }

  atualizarFlor1() {
    this.imagemUrl="assets/imgs/plantafeliz.jpg";
    this.statusPlanta="Planta Feliz";
    this.descricaoPlanta="Tudo certo com sua planta, ela está muito bem irrigada e feliz!";
  }

  atualizarFlor2() {
    this.imagemUrl="assets/imgs/plantatriste.jpg";
    this.statusPlanta="Planta Triste";
    this.descricaoPlanta="Sua planta está triste, necessita ser irrigada urgente!";
  }

  atualizarFlor3(){
    this.imagemUrl="assets/imgs/plantaalagada.jpg";
    this.statusPlanta="Planta Alagada";
    this.descricaoPlanta="Sua planta está com excesso de água, por favor não a irrigue mais até que a umidade tenha voltado ao normal!";
  }

  presentMessage(msg, duration = 5000) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration,
      position: 'bottom'
    });  
    return toast.present();
  }
}