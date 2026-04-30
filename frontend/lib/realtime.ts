type StompHeaders = Record<string, string>;

type StompSubscription = {
  destination: string;
  callback: (body: string) => void;
};

type StompClientOptions = {
  url: string;
  onStatusChange: (status: "connecting" | "connected" | "disconnected") => void;
};

export class StompClient {
  private callbacks = new Map<string, (body: string) => void>();
  private connected = false;
  private nextId = 0;
  private pendingSubscriptions: StompSubscription[] = [];
  private socket: WebSocket | null = null;

  constructor(private readonly options: StompClientOptions) {}

  connect() {
    this.options.onStatusChange("connecting");
    this.socket = new WebSocket(this.options.url);

    this.socket.addEventListener("open", () => {
      this.sendFrame("CONNECT", {
        "accept-version": "1.2",
        "heart-beat": "10000,10000"
      });
    });

    this.socket.addEventListener("message", (event) => {
      this.handleMessage(String(event.data));
    });

    this.socket.addEventListener("close", () => {
      this.connected = false;
      this.options.onStatusChange("disconnected");
    });

    this.socket.addEventListener("error", () => {
      this.connected = false;
      this.options.onStatusChange("disconnected");
    });
  }

  disconnect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.sendFrame("DISCONNECT", {});
    }

    this.connected = false;
    this.socket?.close();
    this.socket = null;
  }

  send(destination: string, body: unknown) {
    if (!this.connected) {
      return false;
    }

    const payload = JSON.stringify(body);
    this.sendFrame(
      "SEND",
      {
        destination,
        "content-type": "application/json",
        "content-length": String(new TextEncoder().encode(payload).length)
      },
      payload
    );
    return true;
  }

  subscribe(destination: string, callback: (body: string) => void) {
    const subscription = { destination, callback };

    if (!this.connected) {
      this.pendingSubscriptions.push(subscription);
      return;
    }

    this.registerSubscription(subscription);
  }

  private handleMessage(data: string) {
    for (const frame of data.split("\0")) {
      if (!frame.trim()) {
        continue;
      }

      const parsed = this.parseFrame(frame);

      if (parsed.command === "CONNECTED") {
        this.connected = true;
        this.options.onStatusChange("connected");
        const subscriptions = [...this.pendingSubscriptions];
        this.pendingSubscriptions = [];
        subscriptions.forEach((subscription) => this.registerSubscription(subscription));
        continue;
      }

      if (parsed.command === "MESSAGE") {
        const subscriptionId = parsed.headers.subscription;
        this.callbacks.get(subscriptionId)?.(parsed.body);
      }
    }
  }

  private parseFrame(frame: string) {
    const [headerBlock, ...bodyParts] = frame.split("\n\n");
    const [command, ...headers] = headerBlock.split("\n");

    return {
      command,
      headers: headers.reduce<StompHeaders>((acc, header) => {
        const separatorIndex = header.indexOf(":");
        if (separatorIndex > -1) {
          acc[header.slice(0, separatorIndex)] = header.slice(separatorIndex + 1);
        }
        return acc;
      }, {}),
      body: bodyParts.join("\n\n")
    };
  }

  private registerSubscription({ destination, callback }: StompSubscription) {
    const id = `sub-${this.nextId}`;
    this.nextId += 1;
    this.callbacks.set(id, callback);
    this.sendFrame("SUBSCRIBE", { id, destination });
  }

  private sendFrame(command: string, headers: StompHeaders, body = "") {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
    this.socket.send(`${command}\n${headerLines.join("\n")}\n\n${body}\0`);
  }
}

export function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
}

export function wsBaseUrl() {
  const apiUrl = new URL(apiBaseUrl());
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  apiUrl.pathname = "/ws-native";
  apiUrl.search = "";
  return apiUrl.toString();
}
