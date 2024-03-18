const express = require("express");
const connectDB = require("./configs/db.config");
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const multer = require("multer");
const xlsx = require("xlsx");
const csv = require("csv-parse");
const { createReadStream } = require("fs");
const Agent = require("./models/agent.model");
const Carrier = require("./models/carrier.model");
const Lob = require("./models/lob.model");
const Policy = require("./models/policy_info.model");
const UserAccount = require("./models/user_account.model");
const User = require("./models/user.model");
const Message = require("./models/message.model");
const cluster = require('cluster');
const os = require('os');
const Monitoring = require("./utilization_script");

const schedule = require('node-schedule');

const numCPUs = os.cpus().length;
const app = express();
Monitoring();
const PORT = 3000;
connectDB();
app.use(express.json());

// Multer middleware setup for file upload
const upload = multer({ dest: "uploads/" });

// function workerInsertData(data) {
//     // console.log("===========>",data)
//   return new Promise((resolve, reject) => {
//     const worker = new Worker(__filename, {
//       workerData: {data},
//     });

//     worker.on("message", (message) => {
//       console.log(message);
//       resolve();
//     });

//     worker.on("error", (error) => {
//       reject(error);
//     });
//   });
// }

// API to upload XLSX/CSV data into MongoDB
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    let data = [];
    if (req.file.originalname.endsWith(".xlsx")) {
      const workbook = xlsx.readFile(req.file.path);
      const sheet_name_list = workbook.SheetNames;
      data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    } else if (req.file.originalname.endsWith(".csv")) {
      data = await new Promise((resolve, reject) => {
        let parsedData = [];
        createReadStream(req.file.path)
          .pipe(
            csv.parse({
              columns: true,
              trim: true,
              skip_empty_lines: true,
              filter: (row) => {
                // Filter out rows with empty values
                return Object.values(row).some((value) => value !== "");
              },
            })
          )
          .on("data", (data) => {
            parsedData.push(data);
          })
          .on("end", () => {
            resolve(parsedData);
          });
      });
    }
        await InsertData(data);

     
    res.send("Data uploaded successfully to MongoDB");
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).send("Error uploading data to MongoDB");
  }
});

console.log("main thread",isMainThread)


const InsertData=async(data)=>{
    try {
                    for (const obj of data) {
                        console.log("data here man",obj)
                        const agent = new Agent({ name: obj.agent });
                
                        const user = new User({
                            firstName: obj.firstname,
                            dob: obj.dob,
                            address: obj.address,
                            phoneNumber: obj.phone,
                            state: obj.state,
                            zip: obj.zip,
                            email: obj.email,
                            gender: obj.gender,
                            userType: obj.userType
                        });
                       const user_account =  new UserAccount({ accountName: obj.account_name });
                
                        const lob = new Lob({ categoryName: obj.category_name });
                
                        const carrier = new Carrier({ companyName: obj.company_name });
                        const policy = new Policy({
                            number: obj.policy_number,
                            startDate: new Date(obj.policy_start_date),
                            endDate: new Date(obj.policy_end_date),
                            categoryId: lob._id, // Assuming the policy category is linked by name
                            companyId: carrier._id,
                            userId:user._id
                            // Add other fields accordingly
                        });
                        await agent.save();
                        await user.save();
                        await user_account.save();
                        await lob.save();
                        await carrier.save();
                        await policy.save();
        
        
                    }
                
                    // parentPort.postMessage(`Data inserted into collection`);
                  } catch (error) {
                    console.error(
                      `Error inserting data into collection:`,
                      error
                    );
                  }
}


app.get('/api/policy-info/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ firstName: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const policyInfo = await Policy.findOne({ userId: user._id }).populate('userId').populate('categoryId').populate('companyId');

        res.json(policyInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/api/aggregated-policy', async (req, res) => {
    try {
        const aggregatedPolicy = await Policy.aggregate([
            // Group by userId and calculate aggregate values
            {
                $group: {
                    _id: '$userId',
                    totalPolicies: { $sum: 1 }, // Count total policies
                    // Add other aggregate calculations if needed
                }
            },
            // Optionally, perform additional operations such as lookup to include user details
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            // {
            //     $unwind: '$userDetails'
            // }
        ]);

        res.json(aggregatedPolicy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/api/message', async (req, res) => {
      try{
        const { message, scheduledAt } = req.body;
        console.log(scheduledAt);
        const scheduledTime = new Date(scheduledAt)
        schedule.scheduleJob(scheduledTime, async () => {
          console.log(`Inserting message: `);
          const newMessage = new Message({
            message,
            scheduledAt: new Date(),
          });
        
          await newMessage.save();
        });
        res.status(201).json({message: 'Your message will be save'});
      }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        }
})


if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker process ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {
  console.log("server run successfully", PORT);
  });
}


// if (!isMainThread) {

//   const { data } = workerData;
//   console.log("data", data)
//     (async()=>{
//         try {
//             // const newData = JSON.parse(data);
//             for (const obj of data) {
//                 console.log("data here man",obj)
//                 // Insert data into Agent collection
//                 const agent = new Agent({ name: obj.agent });
        
//                 // Insert data into User collection
//                 const user = new User({
//                     firstName: obj.firstname,
//                     dob: obj.dob,
//                     address: obj.address,
//                     phoneNumber: obj.phone,
//                     state: obj.state,
//                     zip: obj.zip,
//                     email: obj.email,
//                     gender: obj.gender,
//                     userType: obj.userType
//                 });
        
//                 // Insert data into User's Account collection
//                const user_account =  new UserAccount({ accountName: obj.account_name });
        
//                 // Insert data into Policy Category collection
//                 const lob = new Lob({ categoryName: obj.category_name });
        
//                 // Insert data into Policy Carrier collection
//                 const carrier = new Carrier({ companyName: obj.company_name });
        
//                 // Insert data into Policy Info collection
//                 const policy = new Policy({
//                     number: obj.policy_number,
//                     startDate: new Date(obj.policy_start_date),
//                     endDate: new Date(obj.policy_end_date),
//                     categoryId: lob._id, // Assuming the policy category is linked by name
//                     companyId: carrier._id,
//                     userId:user._id
//                     // Add other fields accordingly
//                 });
//                 await agent.save();
//                 await user.save();
//                 await user_account.save();
//                 await lob.save();
//                 await carrier.save();
//                 await policy.save();


//             }
        
//             parentPort.postMessage(`Data inserted into collection`);
//           } catch (error) {
//             console.error(
//               `Error inserting data into collection:`,
//               error
//             );
//           }
//     })();
  
// }


