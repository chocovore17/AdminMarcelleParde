import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, fromCollectionRef } from "@angular/fire/firestore";
import { FormControl, FormGroup } from "@Angular/forms";
import { formatDate } from '@angular/common';
import { COVIDData } from './COVIDdata';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  curr_covidData: COVIDData[] = [];
  show = true;
  jstoday = '';
  today = new Date();
  myArray: any[] = [];
  message: string;
  single: any;
  jour1: string;
  tmp: string;
  secondForm = new FormGroup({ valueToGet: new FormControl('') })
  form = new FormGroup({
    newValue: new FormControl('')
  })

  constructor(private firestore: AngularFirestore) {
    this.jstoday = formatDate(this.today, 'dd-MM-yyyy', 'en-US');
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


  onQuery(classe: string, nom: string, prenom: string) {
    if (!nom) {
      this.message = 'Entrez un nom de famille à rechercher';
      this.single = null;
    } if (!classe) {
      this.message = 'Entrez une classe svp';
      this.single = null;
    } else {
      var datearray : string[]=[];
      var tables : any[]=[];
      for (var i = 0; i < 7; i++) {
        var dayexact = parseInt(this.jstoday.substring(0, 2));
        var monthexact = parseInt(this.jstoday.substring(3, 5));
        dayexact -= i;
        if (dayexact <= 0) {
          dayexact = 30 + dayexact;
          monthexact -= 1;
        }
        var theday = dayexact.toString();
        var themonth = monthexact.toString();
        if (theday.length < 2) {
          theday = "0" + theday;
        }
        if (themonth.length < 2) {
          themonth = "0" + themonth;
        }
        // check length day and mont greater than 1, else add a 0 at the begining 
        // put this in a function
        datearray.push(theday + "-" + themonth + this.jstoday.substring(5));
      }
        // 1: search  and add to curr covid data for last 7 days 
        var out = this.firestore.collection("MarcelleParde");
        out.get()
          .subscribe(ss => {
            // issue with the date idk why
            if (ss.docs.length === 0) {
              this.message = "Le lycée n'existe pas dans la database.";
              this.single = null;
            } else {
              ss.docs.forEach(doc => {
                var keyvalue = doc.data();
                if (nom in keyvalue&& datearray.includes(doc.id)) {
                  var all_covid_data : COVIDData = new COVIDData();
                  all_covid_data.table = keyvalue[nom];
                  all_covid_data.date=doc.id;
                  this.curr_covidData.push(all_covid_data);
                }
              })
            }
          });

      for (var i = 0; i < this.curr_covidData.length; i++) {
        var casContact = this.firestore.collection("MarcelleParde").doc(this.curr_covidData[i].date).collection(this.curr_covidData[i].table);
        casContact.get()
          .subscribe(ss => {
            if (ss.docs.length === 0) { console.log("not found anyone, he eats alone?")}//do nothing if he eats alone 
            else {
              ss.docs.forEach(doc => {
                console.log("============================================");
                console.log(doc.data());
                // i=0, add to jour 1, etc for each day and print out
              })
            }
          });
      }
    }


    // var out = this.firestore.collection(classe).doc(nom+", "+prenom).collection(this.jstoday);
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
    //         // console.log(this.single);
    //         this.tmp = this.single.table ;
    //       })
    //     }
    //   });

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
  }
}

