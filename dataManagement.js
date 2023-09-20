
// Import the functions you need from the SDKs you need
import { GoToClaim } from "../functions.js";
import { getDocs, collection, getFirestore } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDgE_p1ed7PHao9b4amNSgnzGqu4Q1dcXA",
  authDomain: "jisunaticgo.firebaseapp.com",
  databaseURL: "https://jisunaticgo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jisunaticgo",
  storageBucket: "jisunaticgo.appspot.com",
  messagingSenderId: "675499948960",
  appId: "1:675499948960:web:19dc0bb56e114610c402c5"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const googleAuthProvider = new GoogleAuthProvider();
const db = getFirestore();
const user = auth.currentUser;
export {app, auth, googleAuthProvider, db, user};

var id = '1u3qPd9nvj7VD04yQUidqtsAnpyHNWatiT_B0BVqNX8U';
var gid = '0';
var url = 'https://docs.google.com/spreadsheets/d/'+id+'/gviz/tq?tqx=out:json&tq&gid='+gid;

export function fetchClaimSettings() {
  return fetch(url)
  .then(response => {
    return response.text()
}).then(
    data => { 
      return myItems(data.slice(47, -2))
  });
};

function myItems(jsonString) {

  var json = JSON.parse(jsonString);
  var table = '<table><tr>'
  json.table.cols.forEach(colonne => table += '<th>' + colonne.label + '</th>')
  table += '</tr>'
  let claimSettings = new Array(json.table.rows.length);

  for (let i = 0; i < json.table.rows.length; i++) {
    let rawVersions = json.table.rows[i].c[4].v.split(",");
    let versions = new Array(rawVersions.length);
    for (let j = 0; j < rawVersions.length; j++) {
      var rawVersion = rawVersions[j].split("_");
      versions[j] = {
        name: rawVersion[0],
        price: rawVersion[1]
      }
      // console.log("VERSION " + versions[j].price); 
    }

    claimSettings[i] = {
      storeName: json.table.rows[i].c[0].v,
      isOpen: json.table.rows[i].c[1].v,
      requireFull: json.table.rows[i].c[2].v,
      maxSet: json.table.rows[i].c[3].v,
      versions: versions,
      members: json.table.rows[i].c[5].v.split(",")
    }
    
    // console.log(claimSettings[i]);
  }

  return claimSettings;

  /*
  json.table.rows.forEach(ligne => {
    table += '<tr>'
    ligne.c.forEach(cellule => {
        try{var valeur = cellule.f ? cellule.f : cellule.v}
        catch(e){var valeur = ''}
        table += '<td>' + valeur + '</td>'

      }
    )
    table += '</tr>'
    }
  )
  table += '</table>'
  console.log(json.table.rows[1].c[0]);
  */
}
