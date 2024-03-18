const os = require('os');
const { exec } = require('child_process');
const process = require('process');

// Function to get CPU utilization percentage
function getCPUUsage() {
  return new Promise((resolve, reject) => {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => {
      for (const type in cpu.times) {
        acc += cpu.times[type];
      }
      return acc;
    }, 0);

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);

    resolve(usage);
  });
}

// Function to restart the server using npm
function restartServer() {
  console.log("Server restarting...");
//   process.exit(0);
  exec('npm run stop:dev && npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting server: ${error.message}`);
      return;
    }
    console.log(`Server restarted: ${stdout}`);
  });
}


const monitoringInterval = 5000; 
// Start monitoring
const Monitoring =()=>{
    setInterval(async () => {
        try {
          const cpuUsage = await getCPUUsage();
          console.log(`Current CPU Usage: ${cpuUsage}%`);
      
          if (cpuUsage > 8) {
            restartServer();
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }, monitoringInterval);
      
}

module.exports = Monitoring;
