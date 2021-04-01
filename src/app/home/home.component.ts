import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from "@angular/fire/firestore";
import { FormControl, FormGroup } from "@Angular/forms";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  show = true;
  myArray: any[] = [];
  message:string;
  single:any;
  secondForm = new FormGroup({ valueToGet: new FormControl('') })
  form = new FormGroup({
    newValue: new FormControl('')
})
  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    this.firestore
  .collection("testCollection")
  .get()
  .subscribe((ss) => {
    ss.docs.forEach((doc) => {
      this.myArray.push(doc.data());
    });
  });

  }


  onQuery(classe:string, prenom:string) {
    if (!prenom) {
      this.message = 'Entrez un prénom à rechercher';
      this.single = null;
    }if (!classe) {
      this.message = 'Entrez une classe svp';
      this.single = null;
    } else {
      this.firestore.collection(classe, ref => ref.where("field", "==",prenom)).get()
        .subscribe(ss => {
          if (ss.docs.length === 0) {
            this.message = "Cet élève n'a pas été trouvé. Merci d'essayer à nouveau ou de le contacter.";
            this.single = null;
          } else {
            ss.docs.forEach(doc => {
              this.message = '';
              this.single = doc.data();
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
