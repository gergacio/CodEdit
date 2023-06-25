
import './App.css';
import React, {useState} from 'react';

function App() {
  const [code, setCode] = useState('');
  const handleSubmit = () => {
    console.log(code);
  }
  return (
    <div className="App">
     <h1>Online Compiler</h1>
     <textarea rows="20" cols="75" value={code} onChange={(e) => {setCode(e.target.value)}}></textarea>
     <br />
     <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default App;
