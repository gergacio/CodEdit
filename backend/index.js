const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

const {generateFile} = require(`./genarateFile`);
const {executeCpp} = require(`./executeCpp`);
const { executePy } = require("./executePy");
const { executeJs } = require("./executeJs");
const Job = require("./models/Job");
const { json } = require("express");

mongoose.connect("mongodb://localhost/compilerapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully to mongodb");
});

var port = process.env.PORT || 5005;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.get('/', (req, res) => {
//     return res.json({"hello": "world"});
// });

//separate endpoint check for current status
app.get("/status", async (req, res) => {
    const jobId = req.query.id;
    console.log("status requested", jobId);
  
    if (jobId === undefined) {
      return res
        .status(400)
        .json({ success: false, error: "missing id query param" });
    }
  
    const job = await Job.findById(jobId);
  
    if (job === undefined) {
      return res.status(400).json({ success: false, error: "couldn't find job" });
    }
  
    return res.status(200).json({ success: true, job });
  });


app.post('/run', async(req, res) => {
    const { language = "cpp", code } = req.body;
    console.log(language, code.length);
    if(code === undefined) {
        return res.status(400).json({success: false, error:"empty code body"})
    }
    let job;
    try{
        //we generate a file with content from request
        const filepath = await generateFile(language, code);

        //run the file and send the response
        job = await new Job({language, filepath}).save();
        const jobId = job["_id"];
        console.log(job);

        res.status(201).json({success: true, jobId})
    

        let output;

        job['startedAt'] = new Date();

        if(language == "cpp"){
             output = await executeCpp(filepath);
        }else if(language == "py"){
            output = await executePy(filepath);
        }else {
            output = await executeJs(filepath);
        }

        job["completedAt"] = new Date();
        job["status"] = "success";
        job["output"] = output;

        await job.save();
        console.log(job);
      
        // return res.json({filepath, output});
    }
    catch (err){
        job['completedAt'] = new Date();
        job['status'] = "error";
        job['output'] = JSON.stringify(err);//err could be complicated object
        await job.save();
        console.log(job);
        // res.status(500).json({err});
    }
 
})

app.listen(port, () => {
    console.log(`server start on port ${port}`);
});



// code snippet

// --------------------------------------------
//  c++

// #include <iostream>
// using namespace std;

// int main() {
//   cout << "Hello World!";
//   return 0;
// }

// --------------------------------------------
// py


// import time 

// for i in Range(1, 6)
//     time.sleep(i)
//     print(i)

// --------------------------------------------