import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore, fromCollectionRef } from "@angular/fire/firestore";
import { FormControl, FormGroup } from "@Angular/forms";
import { formatDate } from '@angular/common';
import { COVIDData } from './COVIDdata';
import * as XLSX from 'xlsx'; 
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  curr_covidData = [];
  CasContacts = [];
  public show: boolean = false;
  jstoday = '';
  fullname = '';
  today = new Date();
  message: string;
  fileName= 'CasContacts.xlsx';  
  form = new FormGroup({
    newValue: new FormControl('')
  })

  constructor(private firestore: AngularFirestore) {
    this.jstoday = formatDate(this.today, 'dd-MM-yyyy', 'en-US');
  }

  ngOnInit(): void { }
  showResults() {
    this.show = true;
  }
  
exportexcel(): void 
{
   /* table id is passed over here */   
   let element = document.getElementById('excel-table'); 
   const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

   /* generate workbook and add the worksheet */
   const wb: XLSX.WorkBook = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

   /* save to file */
   XLSX.writeFile(wb, this.fileName);
  
}
  createDateArray(jours: number) {
    var datearray: string[] = [];
    if (jours < 1) jours = 7;
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
    return datearray;
  }
  
  async findTablesAndDates( nom, datearray) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          this.firestore.collection("MarcelleParde").get()
      .subscribe(ss => {
        // issue with the date idk why
        if (ss.docs.length === 0) {
          this.message = "Le lycée n'existe pas dans la database.";
        } else {
          ss.docs.forEach(doc => {
            var keyvalue = doc.data();
            if (nom in keyvalue && datearray.includes(doc.id)) {
              var all_covid_data: COVIDData = new COVIDData(keyvalue[nom], doc.id);
              console.log("all covid data", all_covid_data);
              this.curr_covidData.push(all_covid_data);
            }
          })
        }
      })
        );
      }, 200);
    });
      }

  async findPeopleAtRisk(nom) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          this.curr_covidData.forEach(item => {
            // cascontactscejour.push(item.date);
            this.firestore.collection("MarcelleParde").doc(item.date).collection(item.table).get()
              .subscribe((ss) => {
                ss.docs.forEach((doc) => {
                  if (typeof doc.data().nom !== "undefined" && typeof doc.data().classe !== "undefined") {
                    if(nom.includes(doc.data().nom)){
                      this.fullname = doc.data().nom+', '+doc.data().prenom + ', '+doc.data().classe;
                      console.log(this.fullname);
                    }
                    else{
                      var cascontactscejour = [];
                      cascontactscejour.push(item.date);
                      cascontactscejour.push(doc.data().prenom);
                      cascontactscejour.push(doc.data().nom);
                      cascontactscejour.push(doc.data().classe);
                      this.CasContacts.push(cascontactscejour);
                    // cascontactscejour.push(doc.data().prenom + ' ' + doc.data().nom + ', classe : ' + doc.data().classe);
                    }
                  }
                })
                // this.CasContacts.push(cascontactscejour);
              })
          }));
      }, 600);
    });
  }

  async onQuery(nom: string, prenom:string, jours = 7) { //default display for a week
    // reset all arrays to print only data asked for 
    this.curr_covidData = [];
    if (!nom || !prenom) {
      this.message = 'Entrez un nom de famille et un prénom à rechercher';
    } else {
      var datearray = this.createDateArray(jours);
      console.log("find tables and dates should be done first ");
      this.CasContacts = [];
      nom += ", "+ prenom;
      this.findTablesAndDates(nom, datearray).then(value => {
        this.findPeopleAtRisk(nom);
      });
      // num = await this.findPeopleAtRisk();
      // console.log("find people at risk should be done second ");

    }

  }
}
// TODO 
// Capital pas capital letters
// logo
//  remettre nom et prénom élève
