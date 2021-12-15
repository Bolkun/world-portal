import { Injectable, NgZone } from '@angular/core';
import { User } from '../services/user';
import { Router } from "@angular/router";
import { BehaviorSubject } from 'rxjs';
import { FlashMessagesService } from 'flash-messages-angular';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'; // firebase.auth
import { LoginComponent } from '../components/login/login.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userData: any; // Save logged in user data
  public regIn = false;
  public commentCollection!: AngularFirestoreCollection;
  loggedIn = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedIn.asObservable();
  flashMessageTimeout: number = 5000;

  constructor(
    public afs: AngularFirestore,   // Inject Firestore service
    public auth: AngularFireAuth,   // Inject Firebase auth service
    public ngZone: NgZone,          // NgZone service to remove outside scope warning
    public router: Router,
    public flashMessage: FlashMessagesService,
  ) {
    /* Login if user email verified */
    this.auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        this.GetUserData(user.uid);
        this.loggedIn.next(true);
      } else if (user && !user.emailVerified) {
        this.GetUserData(user.uid);
        this.loggedIn.next(false);
      } else {
        this.loggedIn.next(false);
      }
    });
    this.commentCollection = this.afs.collection('comments');
  }

  SignUp(nickname: string, email: string, password: string) {
    if (nickname == '' || nickname == undefined) {
      this.flashMessage.show('Please write your name!', { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
      return false;
    }
    return this.auth.createUserWithEmailAndPassword(email, password).then((result) => {
      /* Call the SendVerificaitonMail() function when new user sign up and returns promise */
      this.SendVerificationMail();
      this.SetUserData(result.user!, nickname);
      this.regIn = true;
    }).catch((error) => {
      this.flashMessage.show(error.message, { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
    });
  }

  SignIn(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password).then((result) => {
      /* Login if user email verified */
      if (!(result.user?.emailVerified)) {
        this.flashMessage.show('Please verify Email Address!', { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
        return false;
      }
      this.GetUserData(result.user.uid);
      localStorage.setItem('userEmail', JSON.stringify(result.user?.email));
      this.ngZone.run(() => {
        // Go to dashboard
        document.getElementById('closeLogin')!.click();
        document.getElementById('closeLogin')!.style.display = 'none';
      });
    }).catch((error) => {
      this.flashMessage.show(error.message, { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
    });
  }

  SendVerificationMail() {
    const user = firebase.auth().currentUser;
    if (user !== null) {
      if (user.emailVerified) {
        this.flashMessage.show('Email already verified!', { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
      } else {
        // SignUp
        return user.sendEmailVerification().then(() => {
          // Function createUserWithEmailAndPassword() in SignIn method promise that emailVarified will be true
          //this.router.navigate(['verify-email']);
        });
      }
    } else {
      this.flashMessage.show('Cannot send email to unknown user!', { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
    }
  }

  ResetPassword(passwordResetEmail: string) {
    return this.auth.sendPasswordResetEmail(passwordResetEmail).then(() => {
      this.flashMessage.show('Password reset email sent, check your inbox!', { cssClass: 'alert-success', timeout: this.flashMessageTimeout });
    }).catch((error) => {
      this.flashMessage.show(error.message, { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
    });
  }

  isLoggedIn(): boolean {
    const userEmail = JSON.parse(localStorage.getItem('userEmail')!);
    if (userEmail == null) {
      return false;
    } else {
      return true;
    }
  }

  isAdminLoggedIn() {
    if (this.isLoggedIn()) {
      if (this.userData) {
        return (this.userData.role! === 'admin') ? true : false;
      }
    }
    return false;
  }

  // Sign up with Google
  GoogleReg() {
    this.regIn = true;
    return this.RegLogin(new firebase.auth.GoogleAuthProvider());
  }

  // Sign up with Google
  GoogleLog() {
    return this.RegLogin(new firebase.auth.GoogleAuthProvider());
  }

  // Reg logic to run auth providers
  RegLogin(provider: firebase.auth.AuthProvider) {
    return this.auth.signInWithPopup(provider).then((result) => {
      this.ngZone.run(() => {
        // Go to dashboard
        document.getElementById('closeLogin')!.click();
        document.getElementById('closeLogin')!.style.display = 'none';
      });
      this.SetUserData(result.user!);
      localStorage.setItem('userEmail', JSON.stringify(result.user?.email));
    }).catch((error) => {
      this.flashMessage.show(error.message, { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
    });
  }

  // Auth logic to run auth providers
  // AuthLogin(provider: firebase.auth.AuthProvider) {
  //   return this.auth.signInWithPopup(provider).then((result) => {
  //     this.ngZone.run(() => {
  //       document.getElementById('closeLogin')!.click();
  //       document.getElementById('closeLogin')!.style.display = 'none';
  //     });
  //     this.GetUserData(result.user!.uid);
  //     localStorage.setItem('userEmail', JSON.stringify(result.user?.email));
  //   }).catch((error) => {
  //     this.flashMessage.show(error.message, { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
  //   });
  // }

  GetUserData(uid: string) {
    if (uid) {
      const userCollection = this.afs.collection('users', ref => ref.where("uid", "==", uid)).valueChanges();
      userCollection.subscribe((data: any) => {
        this.userData = {
          uid: data[0].uid,
          role: data[0].role,
          email: data[0].email,
          displayName: data[0].displayName,
          photoURL: data[0].photoURL
        }
      });
    }
  }

  GetUserDataOnEmail(email: string) {
    return this.afs.collection('users', ref => ref.where("email", "==", email)).valueChanges();
  }

  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: firebase.User, nickname?: string) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    this.userData = {
      uid: user.uid,
      role: 'registeredUsers',
      email: user.email,
      displayName: (nickname) ? nickname : user.displayName,
      photoURL: user.photoURL!
    }
    return userRef.set(this.userData, {
      merge: true
    });
  }

  getUserPermission(role: string, email?: any) {
    if (!email) return ['all'];
    if (role == 'admin') {
      return [email, 'admin', 'registeredUsers', 'all'];
    } else if (role == 'registeredUsers') {
      return ['registeredUsers', 'all'];
    } else {
      return ['all'];
    }
  }

  // Logout
  SignOut() {
    return this.auth.signOut().then(() => {
      localStorage.removeItem('userEmail');
      let closeButton = document.getElementById('closeLogin');
      if(closeButton) {
        closeButton!.style.display = 'block';
      }
    });
  }

  SaveComment(articleID: string, userID: string, displayName: string, photoURL: string, comment: string) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    var yyyy = today.getFullYear();
    var hour: any = today.getHours();
    var minutes: any = today.getMinutes();
    if (hour < 10) { hour = "0"+hour; }
    if (minutes < 10) { minutes = "0"+minutes; }
    let values: any = {
      articleID: articleID,
      userID: userID,
      displayName: displayName,
      photoURL: photoURL,
      date: dd + '.' + mm + '.' + yyyy + ' ' + hour + ':' + minutes,
      comment: comment
    }
    return this.commentCollection.add(values).then(result => {
      // clear textarea
      (<HTMLInputElement>document.getElementById("text")).value = '';
    }).catch((error) => {
      this.flashMessage.show(error.message, { cssClass: 'alert-danger', timeout: this.flashMessageTimeout });
    });
  }

  getComments(articleID) {
    return this.afs.collection('comments', ref => ref.where("articleID", "==", articleID).orderBy("date", "desc")).valueChanges(); // index in firestore erstellen durch error link
  }
  
}
