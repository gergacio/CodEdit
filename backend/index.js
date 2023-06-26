const express = require("express");
const cors = require('cors');
const {generateFile} = require(`./genarateFile`);
const {executeCpp} = require(`./executeCpp`);
const { executePy } = require("./executePy");
const { executeJs } = require("./executeJs");

var port = process.env.PORT || 5005;

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    return res.json({"hello": "world"});
});


app.post('/run', async(req, res) => {
    const { language = "cpp", code } = req.body;
    console.log(language, code.length);
    if(code === undefined) {
        return res.status(400).json({success: false, error:"empty code body"})
    }
    try{
        const filepath = await generateFile(language, code);
        let output;
        if(language == "cpp"){
             output = await executeCpp(filepath);
        }else if(language == "py"){
            output = await executePy(filepath);
        }else {
            output = await executeJs(filepath);
        }
      
        return res.json({filepath, output});
    }
    catch{
        res.status(500).json({err});
    }
 
})

app.listen(port, () => {
    console.log(`server start on port ${port}`);
});