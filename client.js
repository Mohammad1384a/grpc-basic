const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const echoProto = protoLoader.loadSync("echo.proto", {});
const echoDefinition = grpc.loadPackageDefinition(echoProto);
const { echoPackage } = echoDefinition;
const echoData = {
  value: "my val",
};

const client = new echoPackage.EchoService(
  "localhost:5000",
  grpc.credentials.createInsecure()
);

client.EchoUnary(echoData, (err, res) => {
  if (err) return console.log("Error: ", err.message);
  console.log("Response: ", res);
});

const serverStream = client.EchoServerStream(null, (err, res) => {
  if (err) return console.log(err);
  console.log(res);
});
serverStream.on("data", (data) => {
  console.log("Data: ", data);
});
serverStream.on("end", (err) => {
  console.log("Error: ", err.message);
});

const clientStream = client.EchoClientStream(null, (err, res) => {
  if (err) return console.log(err.message);
  console.log(res);
});

const echos = [
  { value: "val1" },
  { value: "val2" },
  { value: "val3" },
  { value: "val4" },
  { value: "val5" },
];

for (let i = 0; i < echos.length; i++) {
  clientStream.write(echos[i]);
  if (i === echos.length) return clientStream.end();
}

const dateTime = client.dateTime();

for (let i = 0; i <= 10; i++) {
  setInterval(() => {
    dateTime.write({ value: Date.now().toString() });
  }, 300);
  dateTime.on("data", (data) => {
    console.log("the serverdate is: ", data);
  });
}
