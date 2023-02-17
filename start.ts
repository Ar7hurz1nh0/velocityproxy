import "https://deno.land/x/dotenv@v3.2.0/load.ts"
import { EC2 } from 'npm:@aws-sdk/client-ec2'
const decoder = new TextDecoder("utf-8");
const instance = { InstanceIds: [ Deno.env.get("INSTANCE_ID") ?? "" ] }
const key = decoder.decode(Deno.readFileSync("forwarding.secret")).trim();
const mcserver = Deno.env.get("MCSERVER")
const server = Deno.listen({ port: 25500 });
const socat = Deno.run({
  cmd: ["socat", "-d", "-d", "tcp-listen:25524,reuseaddr,fork", `tcp:${mcserver}`],
  stdout: "piped",
})
const ec2 = new EC2({
  region: 'sa-east-1',
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID") ?? "",
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") ?? "",
  }
})
console.log(`Forwarding port 25524 to ${mcserver}`);
console.log(`Listening requests, logging socat output to stdout`);

ec2.startInstances(instance).then(() => console.log("Started Minecraft server"));

(async () => {
  console.log(decoder.decode(await socat.output()));
})();

for await (const conn of server) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const body = requestEvent.request.headers.get("x-key") ?? null;
    console.log("[HTTP]", body == key ? "Supplied key equals. Exiting program" : "Supplied key does not equal. Ignoring request");
    if (body !== key) requestEvent.respondWith(
      new Response("Not found", {
        status: 404,
      }),
    );
    else {
      requestEvent.respondWith(
        new Response("Key accepted", {
          status: 202,
        }),
      );
      server.close();
      socat.kill();
      await socat.status();
      await ec2.stopInstances(instance);
      Deno.exit(0);
    }
  }
}