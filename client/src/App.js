
import axios from 'axios';
import './App.css';
import React, {useState} from 'react';

function App() {

  const [code, setCode] = useState("");

  const [language, setLanguage] = useState("cpp");
  console.log(language);
  const [output, setOutput] = useState("");

  const handleSubmit = async () => {
    const payload = {
      language,
      code
    }
    try{
      const { data } = await axios.post("http://localhost:5005/run", payload)
      setOutput(data.output);
    }catch({response}){
      if(response){
        const errMsg = response.data.err.stderr;
        setOutput(errMsg);
      }else{
        setOutput("Error connecting to server!");
      }
     
    }

    
  }
  return (
    <div className="App">
     <h1>Online Compiler</h1>
     <div>
      <label>Language: </label>
      <select 
      value={language}
      onChange={(e) => {
        setLanguage(e.target.value)
        console.log(e.target.value);
      }}
      >
        <option value="cpp">C++</option>
        <option value="py">Python</option>
        <option value="js">JavaScript</option>
      
      </select>
     </div>
   <br />
     <textarea rows="20" cols="75" value={code} onChange={(e) => {setCode(e.target.value)}}></textarea>
     <br />
     <button onClick={handleSubmit}>Submit</button>
     <p>{output}</p>
    </div>
  );
}

export default App;
