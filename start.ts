import "https://deno.land/x/dotenv@v3.2.0/load.ts"
import { EC2 } from 'npm:@aws-sdk/client-ec2'
const decoder = new TextDecoder("utf-8");
const instance = { InstanceIds: [ Deno.env.get("INSTANCE_ID") ?? "" ] }
const key = decoder.decode(Deno.readFileSync("forwarding.secret")).trim();
const env = Deno.env.toObject()
const server = Deno.listen({ port: Number(env.WEBPORT) });
const sshForwarding = Deno.run({
  cmd: ["ssh", "-g", "-L", `${env.SOURCEPORT}:localhost:${env.MCSERVERPORT}`, "-N", `${env.SOURCEUSER}@${env.MCSERVERADDRESS}`, "-i", env.PEMFILE, "-p", env.SSHPORT],
})
const ec2 = new EC2({
  region: 'sa-east-1',
  credentials: {
    accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID") ?? "",
    secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY") ?? "",
  }
})
console.log(`Forwarding port ${env.SOURCEPORT} to ${env.MCSERVERADDRESS}:${env.MCSERVERPORT}`);
console.log(`Listening requests, logging ssh output to stdout`);

ec2.startInstances(instance).then(() => console.log("Started Minecraft server"));

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
      sshForwarding.kill();
      await sshForwarding.status();
      await ec2.stopInstances(instance);
      Deno.exit(0);
    }
  }
}