import { GoToHome } from "../jgo/functions.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { getDocs, collection, where, query, addDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";
import { app, auth, googleAuthProvider, db, user, fetchClaimSettings} from "../jgo/dataManagement.js";

const storeBtnStyles = `
	background-color: red;
	border: 2px;
	color: white;
	padding-bottom: 10px;
	border: 2px solid black;
`;

const userInfoStyles = `
	position: absolute;
	left: 50%;
	bottom: 20px;
	transform: translate(-50%, -50%);
	margin: 0 auto;
`;

const navigationStyles = `
	position: absolute;
	left: 30px;
	bottom: 10px;
	transform: translate(-50%, -50%);
	margin: 0 auto;
`;

const setDivStyles = `
	/* border: 1px outset red; */
	background-color: lightblue;
	text-align: center;
	width: 100%;
`;
  
const claimButtonStyles = `
	float: left;
	border: 1px solid red;
	margin: 5px;
	width: 100px;
	height: 50px;
`;

const ownedButtonStyles = `
	background-color: blue;
	float: left;
	border: 1px solid red;
	margin: 5px;
	width: 100px;
	height: 50px;
`;

const reservedButtonStyles = `
	background-color: grey;
	float: left;
	border: 1px solid red;
	margin: 5px;
	width: 100px;
	height: 50px;
`;

const memberLabelStyles = `
	position: absolute;
	top: 100px;
	float: left;
	border: 1px solid red;
`;

const storeDivStyles = `
	position: absolute;
	top: 50px;
`;

const loginInfo = document.getElementById("loginInfo");
const body = document.getElementsByTagName("body")[0];
const goToHomePageBtn = document.getElementById("goToHomePageBtn");
var allowClaiming = true;

loginInfo.style = userInfoStyles;
var tempUser = "";

onAuthStateChanged(auth, (user) => {
	if (user) {
		SetSignInfo(user);
	} else {
		loginInfo.innerHTML = "You need to Sign In yo";
	}
});

function SetSignInfo(user)
{
	tempUser = user;
	loginInfo.innerHTML = "Signed in as " + user.email;
	console.log("SETTING UP USER " + user.email);
}

const test = async() => {
	const querySnapshot = await getDocs(collection(db, "Claims"));
	querySnapshot.forEach((doc) => {
	  // doc.data() is never undefined for query doc snapshots
	  console.log(doc.id, " => ", doc.data());
	});
  }

// #region MemberClaim
var claimSettings = [];
var highestSetArray = [];
var claimCollections = {};
var storeMembersDivArray = [];

const storeBtnsDiv = document.createElement("div");
storeBtnsDiv.style = storeDivStyles;
body.appendChild(storeBtnsDiv);

const memberClaimBodyDiv = document.createElement("div");
memberClaimBodyDiv.style = memberLabelStyles;
body.appendChild(memberClaimBodyDiv);

fetchClaimSettings().then(response => {
	claimSettings = response;
	const storeBtnsArray = Array(claimSettings.length);
	// const storeMembersDivArray = Array(claimSettings.length);
	// Store Button Stuff
	for (var i = 0; i < claimSettings.length; i++) {
		var storeBtn = document.createElement("button");
		storeBtn.id = "storeBtn_" + i;
		storeBtn.innerText = claimSettings[i].storeName;
		storeBtn.style = storeBtnStyles;
		storeBtnsDiv.appendChild(storeBtn);
		storeBtnsArray[i] = storeBtn;

		// Member Stuff
		var storeMembersDiv = document.createElement("div");
		storeMembersDiv.id = "storeMembersDiv_" + i;
			storeMembersDiv.style = ` display: none `;
		
		storeMembersDivArray[i] = storeMembersDiv;
		memberClaimBodyDiv.appendChild(storeMembersDiv);

		for (var j = 0; j < claimSettings[i].members.length; j ++) {
			var memberLabel = document.createElement("button");
			memberLabel.innerText = claimSettings[i].members[j];
			memberLabel.style = claimButtonStyles;
			storeMembersDiv.appendChild(memberLabel)

		}
			
		var separatorDiv2 = document.createElement("div");
		separatorDiv2.style = `
			clear: left;
		`;

		storeMembersDivArray[i].appendChild(separatorDiv2);
	}

	for (let i = 0; i < storeBtnsArray.length; i++) {
		storeBtnsArray[i].addEventListener("click", ()=> {
			for (let j = 0; j < storeMembersDivArray.length; j++) {
				if(storeBtnsArray[i].id.split("_")[1] == storeMembersDivArray[j].id.split("_")[1]) {
					storeMembersDivArray[j].style = ' display: block ';
					console.log("I'm clicked!");
				} else {
					storeMembersDivArray[j].style = ' display: none ';
				}
			}
		});
	}

	getDocs(collection(db, "Claims")).then(qSnapshot => {
		qSnapshot.forEach(doc => {
			let entry = {
				storeName: doc.data().storeName,
				set: doc.data().set,
				member: doc.data().member,
				productIndex: doc.data().productIndex,
				owner: doc.data().owner
			};
			var keyStr = entry.storeName + entry.set + entry.member;
			claimCollections[keyStr] = entry;

		});	
	}).then(() => {
		for (let i = 0; i < claimSettings.length; i++) {
			// Create the claim buttons, iterate for every store to look for the highest set count to figure out the number of sets to generate per store.
			let setCount = 0;
			for (const key of Object.keys(claimCollections)) {
				if (claimSettings[i].storeName == claimCollections[key].storeName)
					setCount = setCount < claimCollections[key].set ? claimCollections[key].set : setCount;
			}

			// // If maxSet is -1 means no maximum set.
			if (setCount < (claimSettings[i].maxSet - 1) && (claimSettings[i].maxSet == -1 || (claimSettings[i].maxSet > 0 && setCount > 0)))
				setCount++;

			console.log(claimSettings[i].storeName + " setCount: " + setCount);
			highestSetArray[i] = setCount;
			for (let j = 0; j <= setCount; j++) {
				GenerateNewSet(i, j);
			
			}
		}
	});
})

function GenerateNewSet(storeIndex, set)
{
	for (let k = 0; k < claimSettings[storeIndex].members.length; k++) {
		let claimButton = document.createElement("button");
		claimButton.style = claimButtonStyles;
		let key = claimSettings[storeIndex].storeName + set + claimSettings[storeIndex].members[k];
		claimButton.id = key;
		let text = "AVAIL";
		if (key in claimCollections) {
			console.log(claimCollections[key].owner + " == " + tempUser.email);
			if (claimCollections[key].owner == tempUser.email) {
				claimButton.style = ownedButtonStyles;
				text = "YOURS";
			} else {
				claimButton.style = reservedButtonStyles;
				text = "TAKEN";
			}
		} else {
			claimButton.addEventListener("click", ()=> {
				console.log("canClaim:" + allowClaiming + " | " + "key:" + key + " | " + claimCollections);
				if (!claimSettings[storeIndex].isOpen || !allowClaiming || key in claimCollections) 
					return;

				allowClaiming = false;

				let newEntry = {
					storeName: claimSettings[storeIndex].storeName,
					set: set,
					member: claimSettings[storeIndex].members[k],
					productIndex: 0,
					owner: tempUser.email
				};

				// TEST only
				// claimCollections[key] = newEntry;
				// allowClaiming = true;
				// claimButton.style = ownedButtonStyles;
				// claimButton.innerHTML = "YOURS";

				// console.log(claimSettings[storeIndex].maxSet + " | " + set + " | " + (claimSettings[storeIndex].maxSet - 1));
				// if (newEntry.set == highestSetArray[storeIndex]) {
				// 	highestSetArray[storeIndex] = newEntry.set + 1;

				// 	if (claimSettings[storeIndex].maxSet == -1 || 
				// 		(claimSettings[storeIndex].maxSet > 0 && newEntry.set < (claimSettings[storeIndex].maxSet - 1))) {
				// 		GenerateNewSet(storeIndex, highestSetArray[storeIndex]);
				// 	}
				// }

				//LIVE
				let q = query(collection(db, "Claims"), 
				where("storeName", "==", newEntry.storeName),
				where("set", "==", newEntry.set),
				where("member", "==", newEntry.member));
				getDocs(q).then(qSnapShot => {
					if (qSnapShot.empty) {
						addDoc(collection(db, "Claims"), {
							storeName: newEntry.storeName,
							set: newEntry.set,
							member: newEntry.member,
							productIndex: newEntry.productIndex,
							owner: newEntry.owner
						}).then(()=> {
							claimCollections[key] = newEntry;
							allowClaiming = true;
							claimButton.style = ownedButtonStyles;
							claimButton.innerHTML = "YOURS";
			
							console.log(claimSettings[storeIndex].maxSet + " | " + set + " | " + (claimSettings[storeIndex].maxSet - 1));
							if (newEntry.set == highestSetArray[storeIndex]) {
								highestSetArray[storeIndex] = newEntry.set + 1;
			
								if (claimSettings[storeIndex].maxSet == -1 || 
									(claimSettings[storeIndex].maxSet > 0 && newEntry.set < (claimSettings[storeIndex].maxSet - 1))) {
									GenerateNewSet(storeIndex, highestSetArray[storeIndex]);
								}
							}
						});
					}
				});
			})
		}

		claimButton.innerText = text;
		storeMembersDivArray[storeIndex].appendChild(claimButton);
	}

	var separatorDiv2 = document.createElement("div");
	separatorDiv2.style = `
		clear: left;
	`;
	storeMembersDivArray[storeIndex].appendChild(separatorDiv2);
}

//#region Site Navigation

goToHomePageBtn.addEventListener("click", GoToHome);
goToHomePageBtn.style = navigationStyles;

//#endregion