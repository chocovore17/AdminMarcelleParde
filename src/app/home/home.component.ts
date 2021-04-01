import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { FormControl, FormGroup } from "@Angular/forms";
import {formatDate } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  show = true;
  jstoday = '';
  today= new Date();
  myArray: any[] = [];
  message:string;
  single:any;
  jour1:string;
  tmp:string;
  secondForm = new FormGroup({ valueToGet: new FormControl('') })
  form = new FormGroup({
    newValue: new FormControl('')
})

  constructor(private firestore: AngularFirestore) {
    this.jstoday = formatDate(this.today, 'dd-MM-yyyy',  'en-US');
  }

  ngOnInit(): void {
  //   this.firestore
  // .collection("testCollection")
  // .get()
  // .subscribe((ss) => {
  //   ss.docs.forEach((doc) => {
  //     this.myArray.push(doc.data());
  //   });
  // });

  }
  

  onQuery(classe:string, nom:string,prenom:string) {
    if (!nom) {
      this.message = 'Entrez un nom de famille à rechercher';
      this.single = null;
    }if (!classe) {
      this.message = 'Entrez une classe svp';
      this.single = null;
    } else {
      // Find date
      // find table 
      // All students at this table more or less 10 minutes
      // var citiesRef = this.firestore.collection(classe);
      // var out = this.firestore.collection(classe, ref => ref.where("nom", "==",nom));
      // out.get()
      //   .subscribe(ss => {
      //     if (ss.docs.length === 0) {
      //       this.message = "Cet élève n'a pas été trouvé. Merci d'essayer à nouveau ou de le contacter.";
      //       this.single = null;
      //     } else {
      //       ss.docs.forEach(doc => {
      //         this.message = 'elève trouvé!';
      //         this.single = doc.data();
      //         console.log("============================================");
      //         console.log(this.single);
      //         this.tmp = this.single.nom + ', '+this.single.prenom;
      //       })
      //     }
      //   })
        var out = this.firestore.collection(classe).doc(nom+", "+prenom).collection(this.jstoday);
        out.get()
          .subscribe(ss => {
            if (ss.docs.length === 0) {
              this.message = "Cet élève n'a pas été trouvé. Merci d'essayer à nouveau ou de le contacter.";
              this.single = null;
            } else {
              ss.docs.forEach(doc => {
                this.message = 'elève trouvé!';
                this.single = doc.data();
                console.log("============================================");
                console.log(this.single);
                this.tmp = this.single.table ;
              })
            }
          })
    }
  }

  onSubmit() {
    this.firestore.collection('testCollection').add({
        field: this.form.value.newValue
    })
    .then(res => {
        console.log(res);
        this.form.reset();
    })
    .catch(e => {
        console.log(e);
    })
}

}
