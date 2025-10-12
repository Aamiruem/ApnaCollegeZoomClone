# Real-Time Video/Audio Architectures: P2P, SFU, MCU

Nice — you’ve named the three main architectures for real-time video/audio: P2P, SFU, and MCU. Below I’ll explain what each is, when to use it, pros/cons, common open-source implementations, deployment notes, and a quick recommendation on which to pick depending on your use case.

What they are (short)

P2P (Peer-to-Peer)
Each client sends media directly to every other client. No media server relays/inspects packets (apart from signaling/STUN/TURN). Best for 1:1 or very small groups.

SFU (Selective Forwarding Unit)
A server receives media tracks from each participant and forwards (selectively) those tracks to other participants. It does not mix audio/video — it forwards streams and can do simulcast/subscriptions, bandwidth/adaptive selection.

MCU (Multipoint Control Unit)
A server mixes or composes multiple incoming streams into a single combined stream (audio mixed, video composited) and sends that single stream back to each client. Clients receive one stream only.

Comparison — pros & cons
P2P

Pros

Lowest server cost (no media server).

Lowest latency (direct path if network allows).

Simple architecture.

Cons

Bandwidth explosion for each participant: N peers → each peer must upload N−1 streams.

Not practical beyond ~2–4 participants.

Hard to support recording or advanced centralized features.

When to use

1:1 calls, or tiny group calls (2–3 participants) where conservation of infra is important.

SFU

Pros

Scales much better than P2P: each client sends one uplink and receives N−1 or fewer downlinks but server handles routing.

Supports adaptive forwarding, simulcast, SVC, bandwidth management, per-participant subscriptions.

Lower CPU cost on server than MCU (no heavy decoding/encoding/mixing).

Good for multi-party video conferencing and selective layouts.

Cons

Requires media server infrastructure (complexity + cost).

Clients still get multiple streams (client CPU for rendering + bandwidth); client UX complexity if many participants.

When to use

Most modern conferencing systems for medium and large groups (e.g., 4–100 participants) — conferences, webinars (with selective forward).

Common open-source SFUs

mediasoup — highly flexible, Node.js native RTP handling, production-grade, developer-friendly.

Janus — modular C server, plugin architecture.

Jitsi Videobridge (JVB) — used by Jitsi Meet; works well when paired with signaling stack.

Pion/ion (Go) — good for Go ecosystems.

MCU

Pros

Clients receive one single stream — easy for low-capability devices and simple UI.

Server can produce a single mixed recording stream, single layout, uniform bitrate for clients.

Useful for broadcasting / legacy device compatibility.

Cons

Very CPU/GPU intensive (decoding all incoming streams, mixing, re-encoding).

Higher server cost and latency.

Less flexible for per-participant quality selection.

When to use

When you must deliver a single composed stream to many receivers (broadcast, phone interop, scenarios where client resources are minimal), or when you need server-side mixing for recording or special effects.

Common MCU implementations

Kurento (often used as an MCU/media pipeline)

Some proprietary VM/Cloud offerings provide MCU mixing as a service.

Typical topologies (ASCII)

P2P (3 peers)

A <----> B
 \       \
  \       v
   `----> C
(each sends to every other)

SFU (3 peers)

A ---> SFU --->
B ---^       |---> A
C ---'       '---> B
(Each sends one uplink to SFU; SFU forwards)

MCU (3 peers)

A --> MCU --> A (mixed)
B --> MCU --> B
C --> MCU --> C
(MCU mixes into 1 stream per client)

Which to pick? quick decision guide

1:1 call → P2P (simplest).

Small group (3–4) → P2P may still work, but SFU recommended for reliability.

Team meetings (5–50) → SFU (best balance of cost & experience).

Large broadcasts (hundreds+ viewers) → SFU with broadcast architecture (mixing for a single feed or single-feed re-encodes for viewers). Possibly SFU + CDN.

If you need single composed stream (recording, legacy receivers) → MCU (or server-side recorder + SFU composition).

Recommended software choices

Startups / self-host / Node ecosystem: mediasoup (SFU). Great control and production-ready.

Simple deploy / full stack: Jitsi Meet (includes signaling, JVB SFU). Quick to get running.

Plugin modular server: Janus (C, many plugins).

Cloud / managed: Twilio Video, Agora, Daily.co, Vonage — if you don’t want to operate media servers.

MCU: Kurento (less popular now; heavier), or use cloud provider transcoding/mixing features.

Implementation pointers
If you build an SFU (recommended path)

Use WebRTC for clients. Media server handles RTP; clients use PeerConnections to server or to each other (depending on design).

Implement signaling (WebSocket/Socket.io) to exchange SDP and to control subscriptions (which streams to receive).

Use simulcast or SVC so low-bandwidth clients get lower-resolution layers.

Implement per-client subscription UI (pin speaker, show active speakers) to limit how many streams a client receives.

Add TURN servers for NAT traversal.

If you build an MCU

Expect heavy CPU usage — plan for autoscaling and possibly GPU acceleration for video encoding.

Use MCU only when single output stream simplifes client or you must do server-side layout/processing.

Deployment & operational notes

TURN servers: required for reliable P2P/SFU connections across NATs.

Bandwidth: SFU centralizes bandwidth use on your server; estimate uplink (one per producer) + downlink (server → consumers).

Autoscaling: design SFU clusters and load-balancing (e.g., distribute rooms across SFU instances).

Recording: you can record at the SFU (multi-track) or MCU (single mixed).

Monitoring: measure packet loss, RTT, bitrate, CPU, and memory. Use WebRTC stats on client.

Quick example path to get started (practical)

Prototype P2P using two browsers + node signaling (copy/paste SDP or WebSocket).

Move to SFU: spin up mediasoup (or Jitsi) and implement simple room join + publish/subscribe flow.

Add simulcast and bandwidth constraints, plus TURN.

Optimize UX: active speaker switching, limit visible participants, scale SFU nodes.

If you want, I can immediately do one of the following (pick one) and I’ll produce code/config in this reply:

Minimal Node + WebSocket signaling + P2P HTML demo (manual or automatic SDP exchange).

Starter mediasoup server + minimal client example (publish + subscribe) — Node code + client JS.

Jitsi quick-deploy instructions (docker-compose) for a ready SFU stack.

MCU example using Kurento (server + client code) and notes on CPU requirements.
