const dns = require("dns");

dns.setServers(["8.8.8.8"]);

dns.promises
  .resolveSrv("_mongodb._tcp.interview-ai-cluster.uokdaup.mongodb.net")
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });