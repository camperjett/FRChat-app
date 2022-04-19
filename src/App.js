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
    <button onClick={() => auth.SignOut()}>Sign Out</button>
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
    const {uid, photoURL} = auth.currentUser;
    // console.log(photoURL);
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
    //  to scroll into view on each sent msg
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }
  return(
    <>
      <main>
        <div ref={dummy}></div>
        <div>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        </div>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={e=>setFormValue(e.target.value)}/>
        <button type="submit">Go</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="profile pic"/>
      <p>{text}</p>
    </div>
  )
}

export default App;
