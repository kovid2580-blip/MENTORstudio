"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import { StompClient, wsBaseUrl } from "@/lib/realtime";
import { SectionCard } from "@/components/SectionCard";
import { ZegoVideoPanel } from "@/components/ZegoVideoPanel";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

type ChatMessage = {
  id?: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt?: string;
};

type CodeMessage = {
  sessionId: string;
  senderId: string;
  language: string;
  code: string;
};

type SessionWorkspaceProps = {
  sessionId: string;
};

type ExecutionStatus = "idle" | "running" | "done" | "error";

const defaultCode = `public class Main {
  public static void main(String[] args) {
    System.out.println("Shared editor is live");
  }
}`;

export function SessionWorkspace({ sessionId }: SessionWorkspaceProps) {
  const [chatDraft, setChatDraft] = useState("");
  const [code, setCode] = useState(defaultCode);
  const [executionOutput, setExecutionOutput] = useState("Run code to see the result here.");
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle");
  const [language, setLanguage] = useState("java");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [senderName, setSenderName] = useState("Student");
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const clientRef = useRef<StompClient | null>(null);
  const editorSourceRef = useRef<"local" | "remote">("local");
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const senderId = useMemo(() => makeSenderId(), []);

  useEffect(() => {
    let active = true;

    apiRequest<ChatMessage[]>(`/api/chat/${sessionId}`)
      .then((history) => {
        if (active) {
          setMessages(history);
        }
      })
      .catch(() => {
        if (active) {
          setMessages([]);
        }
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  useEffect(() => {
    const client = new StompClient({
      url: wsBaseUrl(),
      onStatusChange: setStatus
    });

    clientRef.current = client;
    client.subscribe(`/topic/session/${sessionId}/chat`, (body) => {
      const message = JSON.parse(body) as ChatMessage;
      setMessages((current) => {
        if (message.id && current.some((item) => item.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    });

    client.subscribe(`/topic/session/${sessionId}/code`, (body) => {
      const message = JSON.parse(body) as CodeMessage;
      if (message.senderId === senderId) {
        return;
      }

      editorSourceRef.current = "remote";
      setCode(message.code);
      setLanguage(message.language);
    });

    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [senderId, sessionId]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  useEffect(() => {
    if (editorSourceRef.current === "remote") {
      editorSourceRef.current = "local";
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clientRef.current?.send("/app/code", {
        sessionId,
        senderId,
        language,
        code
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [code, language, senderId, sessionId]);

  function sendChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = chatDraft.trim();

    if (!content) {
      return;
    }

    const sent = clientRef.current?.send("/app/chat", {
      sessionId,
      senderId,
      senderName: senderName.trim() || "Guest",
      content
    });

    if (sent) {
      setChatDraft("");
    }
  }

  async function executeCode() {
    setExecutionStatus("running");
    setExecutionOutput("Running...");

    try {
      const output =
        language === "javascript" || language === "typescript"
          ? await runJavaScript(code)
          : runPrintBasedLanguage(code, language);

      setExecutionOutput(output);
      setExecutionStatus("done");
    } catch (caught) {
      setExecutionOutput(caught instanceof Error ? caught.message : "Execution failed.");
      setExecutionStatus("error");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <SectionCard title="Shared Code Editor">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Language"
              className="h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3 text-sm text-[color:var(--ink)]"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
            </select>
            <button
              className="h-10 rounded-md bg-[color:var(--ink)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={executionStatus === "running"}
              type="button"
              onClick={executeCode}
            >
              {executionStatus === "running" ? "Running..." : "Run Code"}
            </button>
          </div>
          <ConnectionBadge status={status} />
        </div>
        <textarea
          className="h-[300px] w-full resize-y rounded-[24px] border border-[color:var(--line)] bg-[color:var(--paper)] p-5 font-mono text-sm leading-7 text-[color:var(--ink)] outline-none transition focus:border-[color:var(--ink)]"
          spellCheck={false}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <div className="mt-4 overflow-hidden rounded-[18px] border border-[color:var(--line)]">
          <div className="flex items-center justify-between border-b border-[color:var(--line)] bg-[#f2f2f2] px-4 py-2">
            <button
              className="h-9 rounded-md bg-[color:var(--paper)] px-3 text-sm font-semibold text-[color:var(--ink)]"
              type="button"
            >
              Execution result
            </button>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              {executionStatus}
            </span>
          </div>
          <pre className="h-[150px] overflow-auto whitespace-pre-wrap bg-[color:var(--paper)] p-4 font-mono text-sm leading-6 text-[color:var(--ink)]">
            {executionOutput}
          </pre>
        </div>
      </SectionCard>

      <div className="grid gap-6">
        <SectionCard title="Chat">
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-1">
            <input
              aria-label="Display name"
              className="h-10 rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--ink)]"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
            />
            <ConnectionBadge status={status} />
          </div>

          <div
            ref={messageListRef}
            className="max-h-[300px] min-h-[180px] space-y-3 overflow-y-auto pr-2 text-sm text-[color:var(--ink)]"
          >
            {messages.length === 0 ? (
              <p className="leading-7 text-[color:var(--muted)]">No messages yet.</p>
            ) : (
              messages.map((message, index) => (
                <article
                  className="rounded-md border border-[color:var(--line)] p-3"
                  key={message.id ?? `${message.senderId}-${message.sentAt ?? index}`}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                    {message.senderName}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap leading-6">{message.content}</p>
                </article>
              ))
            )}
          </div>

          <form className="mt-4 flex gap-2" onSubmit={sendChat}>
            <input
              aria-label="Message"
              className="h-11 min-w-0 flex-1 rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-3 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--ink)]"
              placeholder="Type a message"
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
            />
            <button
              className="h-11 rounded-md bg-[color:var(--ink)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={status !== "connected"}
              type="submit"
            >
              Send
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Video Signaling">
          <ZegoVideoPanel roomId={sessionId} userName={senderName} />
        </SectionCard>
      </div>
    </div>
  );
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span className="inline-flex h-10 items-center rounded-md border border-[color:var(--line)] px-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
      {status}
    </span>
  );
}

function makeSenderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `sender-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function runJavaScript(sourceCode: string) {
  return new Promise<string>((resolve) => {
    const workerSource = `
      const output = [];
      const format = (value) => {
        if (typeof value === "string") return value;
        if (value === undefined) return "undefined";
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      };
      console.log = (...args) => output.push(args.map(format).join(" "));
      console.error = (...args) => output.push(args.map(format).join(" "));
      try {
        const result = (() => {
          ${sourceCode}
        })();
        if (result !== undefined) {
          output.push(format(result));
        }
        self.postMessage(output.join("\\n") || "Program finished without output.");
      } catch (error) {
        self.postMessage(error && error.stack ? error.stack : String(error));
      }
    `;
    const blob = new Blob([workerSource], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timeoutId = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve("Execution timed out after 2 seconds.");
    }, 2000);

    worker.onmessage = (event: MessageEvent<string>) => {
      window.clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data);
    };

    worker.onerror = (event) => {
      window.clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.message);
    };
  });
}

function runPrintBasedLanguage(sourceCode: string, language: string) {
  const pattern =
    language === "python"
      ? /print\(\s*(["'])([\s\S]*?)\1\s*\)/g
      : /System\.out\.println\(\s*(["'])([\s\S]*?)\1\s*\)\s*;/g;
  const output = Array.from(sourceCode.matchAll(pattern), (match) => unescapeText(match[2]));

  if (output.length > 0) {
    return output.join("\n");
  }

  return language === "python"
    ? "No print output found."
    : "No System.out.println output found.";
}

function unescapeText(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'");
}
