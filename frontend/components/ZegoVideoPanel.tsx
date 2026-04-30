"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ZegoVideoPanelProps = {
  roomId: string;
  userName: string;
};

type ZegoInstance = {
  destroy: () => void;
  joinRoom: (config: Record<string, unknown>) => void;
};

type ZegoUIKit = {
  GroupCall: unknown;
  VideoResolution_360P: unknown;
  generateKitTokenForTest: (
    appID: number,
    serverSecret: string,
    roomID: string,
    userID: string,
    userName?: string,
    expirationSeconds?: number
  ) => string;
  create: (kitToken: string) => ZegoInstance;
};

const envZegoAppId = process.env.NEXT_PUBLIC_ZEGO_APP_ID ?? "";
const envZegoServerSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET ?? "";

export function ZegoVideoPanel({ roomId, userName }: ZegoVideoPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<ZegoInstance | null>(null);
  const [credentials, setCredentials] = useState({
    appId: envZegoAppId,
    serverSecret: envZegoServerSecret
  });
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [shouldJoin, setShouldJoin] = useState(false);
  const safeRoomId = useMemo(() => sanitizeZegoId(roomId), [roomId]);
  const userId = useMemo(() => sanitizeZegoId(makeUserId()), []);
  const safeUserName = userName.trim() || "Guest";
  const zegoAppId = Number(credentials.appId);
  const isConfigured =
    Number.isFinite(zegoAppId) && zegoAppId > 0 && credentials.serverSecret.length > 0;

  useEffect(() => {
    const savedAppId = envZegoAppId || window.localStorage.getItem("mentor-zego-app-id") || "";
    const savedServerSecret =
      envZegoServerSecret || window.localStorage.getItem("mentor-zego-server-secret") || "";

    setCredentials({
      appId: savedAppId,
      serverSecret: savedServerSecret
    });
  }, []);

  useEffect(() => {
    if (!shouldJoin || !isConfigured || !containerRef.current) {
      return;
    }

    let cancelled = false;

    async function joinZegoRoom() {
      try {
        setError("");
        setReady(false);
        const { ZegoUIKitPrebuilt } = (await import(
          "@zegocloud/zego-uikit-prebuilt"
        )) as { ZegoUIKitPrebuilt: ZegoUIKit };

        if (cancelled || !containerRef.current) {
          return;
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          zegoAppId,
          credentials.serverSecret,
          safeRoomId,
          userId,
          safeUserName,
          60 * 60
        );

        const instance = ZegoUIKitPrebuilt.create(kitToken);
        instanceRef.current = instance;
        instance.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall
          },
          maxUsers: 2,
          sharedLinks: [
            {
              name: "Session link",
              url: window.location.href
            }
          ],
          showPreJoinView: false,
          showRoomTimer: true,
          showTextChat: false,
          showUserList: true,
          showScreenSharingButton: true,
          showAudioVideoSettingsButton: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          turnOnCameraWhenJoining: false,
          turnOnMicrophoneWhenJoining: false,
          videoResolutionDefault: ZegoUIKitPrebuilt.VideoResolution_360P,
          layout: "Auto"
        });
        setReady(true);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load ZEGOCLOUD.");
      }
    }

    joinZegoRoom();

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [
    credentials.serverSecret,
    isConfigured,
    safeRoomId,
    safeUserName,
    shouldJoin,
    userId,
    zegoAppId
  ]);

  if (!shouldJoin) {
    return (
      <div className="rounded-md border border-[color:var(--line)] p-4 text-sm text-[color:var(--muted)]">
        <button
          className="h-11 w-full rounded-md bg-[color:var(--ink)] px-4 text-sm font-semibold text-white"
          type="button"
          onClick={joinCall}
        >
          Join Call
        </button>
        {error ? <p className="mt-2 text-red-700">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="h-[420px] overflow-hidden rounded-md border border-[color:var(--line)] bg-black"
      />
      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
        <span>Room {safeRoomId}</span>
        <span>{ready ? "Zego ready" : "Loading Zego"}</span>
      </div>
      <div className="rounded-md border border-[color:var(--line)] p-3 text-sm leading-6 text-[color:var(--muted)]">
        If you see <span className="font-mono text-[color:var(--ink)]">1001004</span>, the
        ZEGOCLOUD App ID is incorrect or belongs to a different environment than the token.
        Use the numeric AppID from the same project as your Server Secret.
        <button
          className="mt-3 block h-10 rounded-md border border-[color:var(--line)] px-3 text-sm font-semibold text-[color:var(--ink)]"
          type="button"
          onClick={resetCredentials}
        >
          Change Zego Credentials
        </button>
      </div>
      {error ? <p className="text-sm leading-6 text-red-700">{error}</p> : null}
    </div>
  );

  function joinCall() {
    if (!isConfigured) {
      setError("ZEGOCLOUD credentials are missing. Add them to frontend/.env.local first.");
      return;
    }

    setError("");
    setShouldJoin(true);
  }

  function resetCredentials() {
    instanceRef.current?.destroy();
    instanceRef.current = null;
    window.localStorage.removeItem("mentor-zego-app-id");
    window.localStorage.removeItem("mentor-zego-server-secret");
    setReady(false);
    setShouldJoin(false);
    setError("");
    setCredentials({
      appId: "",
      serverSecret: ""
    });
  }
}

function sanitizeZegoId(value: string) {
  const sanitized = value.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 64);
  return sanitized || "demo_room";
}

function makeUserId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `user_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
