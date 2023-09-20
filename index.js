
// Import the functions you need from the SDKs you need
import { GoToClaim } from "../functions.js";
import { getDocs, collection, getFirestore } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import {app, auth, googleAuthProvider, db, user} from "../dataManagement.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
  
const loginInfo = document.getElementById("loginInfo");
const goToClaimPageBtn = document.getElementById("goToClaimPageBtn");
const loginGroup = document.getElementById("loginGroup");
const menuGroup = document.getElementById("menuGroup");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const signOutBtn = document.getElementById("signOutBtn");
const getDataBtn = document.getElementById("getDataBtn");

loginGroup.hidden = true;
menuGroup.hidden = true;

if (user) {
  loginGroup.hidden = true;
  menuGroup.hidden = false;
} else {
  loginGroup.hidden = false;
  menuGroup.hidden = true;
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginGroup.hidden = true;
    menuGroup.hidden = false;
    SetSignInfo(user);
  } else {
    loginGroup.hidden = false;
    menuGroup.hidden = true;
  }
});

const userSignIn = async() => {
  signInWithPopup(auth, googleAuthProvider)
  .then((result) => {
      const user = result.user
      console.log(user);
  }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message
  })
}

const userSignOut = async() => {
  signOut(auth).then(() => {
    loginInfo.innerHTML = "Sign in required.";
    alert("You have signed out successfully!");
  }).catch((error) => {})
}

const test = async() => {
  const querySnapshot = await getDocs(collection(db, "Claims"));
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
  });
}

function SetSignInfo(user)
{
  console.log("EMA " + user.email);
  loginInfo.innerHTML = "Signed in as " + user.email;
}

goToClaimPageBtn.addEventListener("click", GoToClaim);
googleLoginBtn.addEventListener("click", userSignIn);
getDataBtn.addEventListener("click", test);
signOutBtn.addEventListener("click", userSignOut);

