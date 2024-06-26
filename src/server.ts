import { WebSocket, WebSocketServer } from "ws";
import { PORT } from "./constants";

let nextId = 0;

type WebSocketData = {
	id: number;
	[key: string]: any;
};

const wsMap = new Map<WebSocket, WebSocketData>();

export function setupServer() {
	const wss = new WebSocketServer({ port: Number(PORT) });

	wss.on("connection", (ws, req) => {
		const ip = req.socket.remoteAddress;
		console.log(`Client on ip: ${ip} connected`);
		ws.on("error", console.error);

		ws.on("message", (data, isBinary) => {
			console.log("received from client %d: %s", wsMap.get(ws).id, data);
			wss.clients.forEach((client) => {
				if (client !== ws && client.readyState === WebSocket.OPEN) {
					client.send(data, { binary: isBinary });
				}
			});
		});
		ws.on("ping", () => {
			console.log("Server pinged");
		});

		ws.on("connection", () => {
			console.log("client connected");
		});

		ws.on("close", () => {
			console.log(`Client ${wsMap.get(ws).id} disconnected`);
		});

		wsMap.set(ws, { id: nextId++ });

		console.log(`Client ${wsMap.get(ws).id} connected`);
	});

	console.log("Web socket server open on port %d!", PORT);
	return wss;
}
