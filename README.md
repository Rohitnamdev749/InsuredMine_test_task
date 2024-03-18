# Features:
Try to complete all the mentioned tasks.

## Steps:

1. Clone the repository.
2. Go to root of the repository.
3. Run <b>npm install</b> command to install the node modules in terminal.
4. To run local server run <b>npm run dev</b> command in terminal.
5. Server run on Port 3000.


## End-points:
<ol>
<li>
<p><span> Upload file url: </span> http://localhost:3000/api/upload </p>
</li>
<li>
<p><span> Get policy details using username: </span> http://localhost:3000/policy-info/Lura Lucca </p>
</li>
<li>
<p><span> Get policy aggregated: </span> http://localhost:3000/aggregated-policy </p>
</li>
<li>
<p><span> create message : </span> http://localhost:3000/api/message </p>
</li>

</ol>

### file upload body using form-data
    file: upload csv or xlsx file

### create message body
    {
        "message":"",
        "scheduledAt": "2024-03-17T18:00:19.643Z"
    }