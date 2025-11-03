  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
    // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAlF-inc0iFIVfxaFmGvk4fYp9_gwfGv0Y",
    authDomain: "live-hive.firebaseapp.com",
    projectId: "live-hive",
    storageBucket: "live-hive.firebasestorage.app",
    messagingSenderId: "476762894097",
    appId: "1:476762894097:web:85f1346e77222176d726b0",
    measurementId: "G-9P0FBBLFM7"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
//   const analytics = getAnalytics(app);
  const auth = getAuth(app);

$("#submit-sign-in").on("click", async (e)=> {
    e.preventDefault();
    let email = $("#inputEmail").val();
    let password = $("#inputPassword").val();
    let username = $("#inputName").val();

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            var user = userCredential.user;
            user.displayName = username;
            localStorage.setItem('username', user.displayName);
            alert("Account created successfully, welcome to the hive " + user.displayName);
            window.location.href = "http://127.0.0.1:5500/index.html";
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
            // ..
        });
});

$("#submit-login").on("click", async (e)=> {
    e.preventDefault();
    let email = $("#loginEmail").val();  
    let password = $("#loginPassword").val();

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            var user = userCredential.user;
            localStorage.setItem('loggedIn', true);
            alert("Welcome back to the hive " + localStorage.getItem('username'));
            window.location.href = "http://127.0.0.1:5500/index.html";
            // $("#navLogin").html('');
            // $("#navLogin").html(localStorage.getItem('username'));
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
            // ..
        });
});