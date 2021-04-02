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
  curr_covidData = [];
  CasContacts = [];
  public show:boolean = false;
  jstoday = '';
  today = new Date();
  message: string;
  form = new FormGroup({
    newValue: new FormControl('')
  })

  constructor(private firestore: AngularFirestore) {
    this.jstoday = formatDate(this.today, 'dd-MM-yyyy', 'en-US');
  }

  ngOnInit(): void {}
  showResults(){
    this.show = true;
  }

  onQuery( nom: string, jours: number = 7) { //default display for a week
    // reset all arrays to print only data asked for 
    var listtables = [];
    var listdates= [];
    this.curr_covidData = [];
    var out = this.firestore.collection("MarcelleParde");
    if (!nom) {
      this.message = 'Entrez un nom de famille à rechercher';
    }  else {
      var datearray : string[]=[];
      for (var i = 0; i < jours; i++) {
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
      out.get()
      .subscribe(ss => {
        // issue with the date idk why
        if (ss.docs.length === 0) {
          this.message = "Le lycée n'existe pas dans la database.";
        } else {
          ss.docs.forEach(doc => {
            var keyvalue = doc.data();
            if (nom in keyvalue&& datearray.includes(doc.id)) {
              var all_covid_data : COVIDData = new COVIDData(keyvalue[nom], doc.id);
              this.curr_covidData.push(all_covid_data);
              listtables.push(keyvalue[nom]);
              listdates.push(doc.id);
            }
          })
        }
      });
      listdates.forEach(item=>{
        console.log(item);
        console.log(item);
      })
      this.CasContacts = [];
      // find people who were in contact from tuple (day, table)
      this.curr_covidData.forEach(item =>{
        var cascontactscejour = [];
        cascontactscejour.push(item.date);
         this.firestore.collection("MarcelleParde").doc(item.date).collection(item.table).get()
          .subscribe((ss) => {
            ss.docs.forEach((doc) => {
               if(typeof doc.data().nom !== "undefined" && typeof doc.data().classe !== "undefined"){
                cascontactscejour.push(doc.data().prenom+ ' ' + doc.data().nom+ ', classe : '+ doc.data().classe+'\n');
               }
            })
            this.CasContacts.push(cascontactscejour);
          })
         });
    }
    console.log(this.CasContacts);

  }
}


// TO : 
//  can choose how far back want to get 
//  fix double press button 
