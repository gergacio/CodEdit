
import axios from 'axios';
import './App.css';
import React, {useState, useEffect} from 'react';
import stubs from './defaultStubs.js';
import moment from "moment";

function App() {

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("js");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "js";
    setLanguage(defaultLang);

  },[]);

  useEffect(() => {
    setCode(stubs[language]);

  },[language]);

  const setDefaultLanguage = () => {
    localStorage.setItem("default-language", language);
    console.log(`${language} set as default language.`);
  }
  const renderTimeDetails = () => {
    if(!jobDetails){
      return "";
    }
    let { submittedAt, startedAt, completedAt } = jobDetails;
    let result = "";
    submittedAt = moment(submittedAt).toString();
    result += `  Submitted At: ${submittedAt}  `;
    if (!startedAt || !completedAt) return result;
    const start = moment(startedAt);
    const end = moment(completedAt);
    const diff = end.diff(start, "seconds", true);
    result += ` |  Execution Time: ${diff}s`;
    return result;
  }

  const handleSubmit = async () => {
    const payload = {
      language,
      code
    }
    try{
      setJobId("");
      setStatus("");
      setOutput("");
      const { data } = await axios.post("http://localhost:5005/run", payload)
      console.log(data);
      setJobId(data.jobId);

      let intervalId;

      intervalId = setInterval(async () => {
        const { data: dataRes } = await axios.get(
          `http://localhost:5005/status`,
          {
            params: {
              id: data.jobId,
            },
          }
        );
        const {success, job, error} = dataRes;
        console.log(dataRes);

        //check success
        if(success){
          const {status: jobStatus, output: jobOutput} = job;
          setStatus(jobStatus);
          setJobDetails(job);
          if(jobStatus === "pending"){
            return;
          }
          setJobId(jobOutput);
          //if success stop requests!
          clearInterval(intervalId);

        }else{
          setStatus("Error: please retry")
          console.error(error);
          clearInterval(intervalId);
          setOutput(error);
        }
        console.log(dataRes);
       
 
      }, 1000);



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
    <div>
     <p><span class="logo">G|G|G</span></p>
     <h1>CodEdit.</h1>
     <div className='editor'>
      <div>
      <label>Language: </label>
      <select 
      value={language}
      onChange={(e) => {
        let response = window.confirm("WARNING: Switching the language will remove your current code. Do you want to proceed?");
        if(response){
          setLanguage(e.target.value)
        }
     
        // console.log(e.target.value);
      }}
      >
        <option value="cpp">C++</option>
        <option value="py">Python</option>
        <option value="js">JavaScript</option>
      
      </select>
      <span> <button onClick={setDefaultLanguage}> Set Default </button></span>
      </div>    
     <br/>
     <textarea rows="20" cols="100" value={code} onChange={(e) => {setCode(e.target.value)}}></textarea>
     <br />
     <button onClick={handleSubmit}>Submit</button>
     <br/>
     <br/>
     <label>Submission Details</label>
     <p>Current Status: {status} | {renderTimeDetails()}</p>
     <br/>

     <p>Output</p>
      <p> {jobId && `${jobId}`}</p>
    </div>
    </div>
  );
}

export default App;
