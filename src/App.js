import './App.css';
import React, {useState, useRef} from "react";
import firebase from "firebase/compat/app";
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyAIxxxqsCV2J92L_hwWGhbka-zP7zY5o-I",
  authDomain: "rfchat-cb090.firebaseapp.com",
  projectId: "rfchat-cb090",
  storageBucket: "rfchat-cb090.appspot.com",
  messagingSenderId: "710141276804",
  appId: "1:710141276804:web:16261a3057bf07b62e08d1"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);
  // console.log(user);
  return (
    <div className="App">
      <header className="App-header">
        {user ? <SignOut /> : null}
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}
function SignIn(){
  const signInWithGoogle = () =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);

  }
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}
function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const dummy = useRef();
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt');
  const [messages]  = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    if(formValue !== ""){
      const {uid, photoURL} = auth.currentUser;
      // console.log(photoURL);
      await messageRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })
    }
    setFormValue('');
    //  to scroll into view on each sent msg
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }
  return(
    <>
      <main>
        <div>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        </div>
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={e=>setFormValue(e.target.value)}/>
        <button type="submit">Go</button>
      </form>
    </>
  )
}
function prettyDate2(time) {
  var date = new Date(parseInt(time));
    var localeSpecificTime = date.toLocaleTimeString();
    return localeSpecificTime.replace(/:\d+ /, ' ');
}
function ChatMessage(props){
  const {text, uid, photoURL, createdAt} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  // console.log(createdAt === null ? "WAIT up" : createdAt.toDateString());
  // console.log(createdAt.toDate().toDateString());
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="profile pic"/>
      <p className='time-stamp'>{createdAt === null ? "..." : createdAt.toDate().toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})}</p>
      <p>{text}</p>
    </div>
  )
}

export default App;
