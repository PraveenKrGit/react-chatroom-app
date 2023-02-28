import { useState, useRef } from "react";
import "./App.css";
import chatbubble from "./assets/logo2.png";

//firebase sdk
import firebase from "firebase/compat/app";

//database and authentication
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyAgDL6P8LNUT8lxIMv5dQ-gguotK3St4Qw",
  authDomain: "react-chat-app-1c0fa.firebaseapp.com",
  projectId: "react-chat-app-1c0fa",
  storageBucket: "react-chat-app-1c0fa.appspot.com",
  messagingSenderId: "57778632290",
  appId: "1:57778632290:web:e57b024874a22992b4433b",
  measurementId: "G-FG47YTD9H6",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Messages</h1>
        <div className="signout">
          <SignOut />
        </div>
      </header>

      <section>
        {/* //if user is defined show chatroom otherwise if user is null show sign in */}
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

//sign in page..
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <div className="front-page">
        <img className="logo" src={chatbubble} />

      <div className="logo-sec">
        <p className="title">ChatRoom.<br /><span>A Chat App</span></p>
      </div>

      <div className="welcome">
        <p className="wel">Welcome</p>
        <div className="google-sign" onClick={signInWithGoogle}>
          <img
            class="google-icon"
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          />
          <p className="sign-in-txt">Sign in with Google</p>
        </div>
      </div>
    </div>
  );
}

//sign out button
function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

//input text
function ChatRoom() {
  const dummy = useRef();
  //make reference to the database
  const messagesRef = firestore.collection("messages");
  //make query to database which is ordered by createdAt
  const query = messagesRef.orderBy("createdAt").limit(25);

  //listen to any update in realtime
  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Text message"
        />
        {/* <button className="send"  ></button> */}
        <button className="btn" type="submit" disabled={!formValue}>
          <i class="fa fa-send"></i>
        </button>
      </form>
    </>
  );
}

//message
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p className="para">{text}</p>
      </div>
    </>
  );
}

export default App;
