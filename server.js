const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const echoProto = protoLoader.loadSync("echo.proto", {});
const echoDefinition = grpc.loadPackageDefinition(echoProto);
const { echoPackage } = echoDefinition;
const server = new grpc.Server();

function EchoUnary(call, callBack) {
  console.log("Call: ", call.request);
  callBack(null, {
    message: "done",
    something: "something",
  });
}
function EchoClientStream(call, callBack) {
  call.on("data", (data) => {
    console.log(data);
  });
  call.on("end", (err) => {
    console.log(err);
  });
}
function EchoServerStream(call, callBack) {
  for (let i = 0; i <= 10; i++) {
    call.write({
      value: i,
    });
  }
  call.on("end", (err) => {
    console.log("Error: ", err);
  });
}
function dateTime(call, callBack) {
  call.on("data", (data) => {
    console.log("Client data is: ", data);
  });
  call.write({ value: Date.now().toString() });
  call.on("end", (err) => {
    console.log(err);
  });
}

server.addService(echoPackage.EchoService.service, {
  EchoUnary,
  EchoClientStream,
  EchoServerStream,
  dateTime,
});

server.bind("localhost:5000", grpc.ServerCredentials.createInsecure());
console.log("running on port 5000");
server.start();
