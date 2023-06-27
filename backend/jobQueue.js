const Queue = require("bull");

const jobQueue = new Queue('job-queue');
const NUM_WORKERS = 5;
const Job = require('./models/Job');
const {executeCpp} = require(`./executeCpp`);
const { executePy } = require("./executePy");
const { executeJs } = require("./executeJs");

jobQueue.process(NUM_WORKERS, async({data}) => {
    console.log(data);
    const { id:jobId } = data;
    const job = await Job.findById(jobId);
    if(job === undefined) {
        throw Error("just no found");
    }
    console.log("Fetched Job", job);

    try{

        job['startedAt'] = new Date();

        if(job.language == "cpp"){
             output = await executeCpp(job.filepath);
        }else if(job.language == "py"){
            output = await executePy(job.filepath);
        }else {
            output = await executeJs(job.filepath);
        }

        job["completedAt"] = new Date();
        job["status"] = "success";
        job["output"] = output;

        await job.save();
        
        // return res.json({filepath, output});
        return true;
    }catch{

    }


   
});

jobQueue.on('failed', (error) => {
    console.log(error.data.id, "failed", error.failedReason);

});

const addJobToQueue = async(jobId) => {
    await jobQueue.add({id: jobId});
}



module.exports = {
    addJobToQueue
}