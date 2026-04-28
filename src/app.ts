import app from "./config/server";
import os from "os";

const PORT = Number(process.env.PORT_APP) || 3001;

const interfaces = os.networkInterfaces();
let localIp = "localhost";

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]!) {
    if (iface.family === "IPv4" && !iface.internal) {
      localIp = iface.address;
    }
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor pronto para receber conexões!

  Para acessar localmente (neste computador):
  ➡️  http://localhost:${PORT}

  Para acessar de outros dispositivos na mesma rede (como seu celular):
  ➡️  http://${localIp}:${PORT}
  `);
});