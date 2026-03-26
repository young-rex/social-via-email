**Author:** Rex Young
**Email:** rex@fastmessenger.com
**License:** [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)

# Lemitar: A Vision for Owned Digital Presence

## 1. Introduction

Before Lemitar, a person's digital existence is fragmented and unowned. Their contacts, conversations, and interactions are scattered across platforms that don't know about each other. Each platform holds a piece of how the person interacts with others, but there is no single "them" online — just fragments spread across services. Most of these fragments are held by platforms — platforms that can change terms, deplatform them, or shadow ban them.

Existing approaches address parts of this problem — federated networks, self-hosted tools, decentralized identity standards — but none has unified identification ownership, data portability, and social interaction into a framework that works for ordinary people. And people cannot decide how their digital presence behaves as a whole — each platform defines what they can do within its walls.

After Lemitar, a person has a unified and owned digital presence. Lemitar gives a name and structure to the idea that a person should be at the center — owning their identification and data — and the software serves them rather than the other way around. Lemitar deliberately unifies all these scattered features (texting, social media, GPS, etc.) into one named concept — an avatar — rather than leaving them as disconnected tools or calling it a vague term like "digital body."

This is not a technical specification. It is a vision for how digital life should be organized — a societal argument with technical enablers, not a technical argument with societal implications. The working proof of concept, [Social via Email](https://github.com/LeminaLLC/social-via-email), demonstrates that the ideas here are viable, not hypothetical.

The name Lemitar combines Lemina and Avatar. [Lemina](https://doi.org/10.36227/techrxiv.175339121.11973602) is a programming model that covers three levels: inside-program (object-to-object invocations within a program), program-to-program (invocations across programs, where invocation and communication begin to merge), and program-to-program-plus-human (humans join program-to-program communication). Lemitar is born at the third level — where the participants are no longer just software, but people.

## 2. Lemitar Structure

A Lemitar consists of two elements: Lemitar ID and Lemitar Body. ID means Identifier — a label determined by a system (the internet) to locate and reference a Lemitar, much like a street address is determined by and part of the postal system. Identity, by contrast, belongs to the person behind the Lemitar, not to the Lemitar itself.

These two elements are not equal peers — there is a concept hierarchy, including the supporting infrastructure that enables them:

1. **Lemitar ID** — The foundation. It precedes the other concepts and implicitly invites the underlying system (the internet) to lay the groundwork for the rest.
2. **Lemitar Body** — A conceptual container for what a Lemitar can do. More of a concept than a solid software product.
3. **Data and Protocol** — Not part of the Lemitar itself, but the infrastructure ID and Body need to function. Body uses data to remember and protocols to communicate.

The hierarchy is real — ID is the foundation and plays a more important role than Body. But a Lemitar is the unified whole, not any single element. An ID without a Body is just an address. A Body without an ID has no anchor in the system and no ownership. It is all of them playing together that form a Lemitar — the emergence comes from their unification, not from any one part in isolation.

### 2.1. Lemitar ID

#### 2.1.1. Four Abilities

Splitting a Lemitar into ID and Body seems like a small step, but it is a large leap. The real insight is in what qualifies as a Lemitar ID. All interaction — including socialization — depends on four abilities:

- **Referenceability** — Before Alice can interact with Bob, Bob has to exist in Alice's mind. She references him by name or face. Without referenceability, people cannot think about others or mention them in conversation.
- **Reachability** — When Alice and Bob want to engage further, Alice needs to locate Bob and reach him. If they're a thousand miles apart, she finds his phone number. Technology extends human reach. In the real world, different technologies and organizations — postal services, phone networks, the internet — provide reachability for different purposes.
- **Deliverability** — Reachability's counterpart: once you've located someone, can you actually get a message through? If Alice can't speak, Bob can't hear, and there's no medium to carry her voice, talking doesn't happen. The same logic applies to every communication system.
- **Ownability** — In the physical world, you own your mouth, your hands, your body — the instruments of your interaction. Others cannot censor you at this level; censorship comes from higher-level systems like laws and institutions. Ownability is the ability to own your means of interaction.

These four abilities reflect how human interaction happens in the physical world. An independent Lemitar ID must satisfy all four.

#### 2.1.2. Domain Name as Lemitar ID

A domain name is the most fundamental identifier on the internet — it cannot be broken down further. Everything else (email addresses, social handles, URLs) is built on top of domain names. When a platform gives someone a handle, that handle sits on top of the platform's domain — the person does not own it.

Platforms themselves operate on top of the internet's domain system, then use their own software and infrastructure to support user handles. This places a handle on top of a higher-level mechanism built over the internet itself — multiple layers of dependency away from the fundamental level.

Domain names offer regular people the same ownability that corporations have. A Lemitar ID based on a domain name the person owns (like `alice.smith-family.com`) satisfies all four abilities in a unified way:

- Referenceability — it identifies the person
- Reachability — it locates the person on the internet
- Deliverability — the internet's infrastructure carries messages through
- Ownability — the person owns the domain

A Lemitar ID can also be expressed as an email address on an owned domain (like `alice@smith-family.com`). A bare domain name does not function on its own — it needs software and a protocol to listen for incoming contacts. An email address is essentially a pre-configured domain name: SMTP as the protocol and an email server as the software are already in place. Other configurations are equally valid — a domain could use a WebSocket server or any other listening mechanism. Both satisfy the four abilities in the same way and to the same degree. In either case, interactions remain asynchronous — being online does not mean responding immediately.

#### 2.1.3. Independent and Dependent Lemitars

A Lemitar ID without ownability can still function on the internet, but it is a dependent Lemitar. An email address like `alice@one-company.com` has referenceability, reachability, and deliverability — but the provider owns the domain and can revoke, censor, or change terms. Just as a person can work as self-employed or work for an employer, a Lemitar can function as independent or dependent. The nature of their existence is fundamentally different.

An independent Lemitar can still use platforms — letting them host features is just a business relationship. The person can use multiple platforms simultaneously, leave any platform and take their ID and data with them, or mix free, paid, open source, and DIY software. What matters is the ability to walk away. Ownability also depends on domain hierarchy — a subdomain or mailbox under someone else's domain (even a family member's) is a softer dependency, but a dependency nonetheless.

#### 2.1.4. Lemitar ID Attributes

A Lemitar ID can have attributes such as human names, pictures, and signatures. These are not the ID itself but serve secondary functions — making the person easier to remember and reference by other people.

#### 2.1.5. Identity Proof and Encryption

This document focuses on what Lemitar is and whether it works. Security is not explored in depth, but the baseline is established: each Lemitar should have an X.509 certificate for domain name or email address verification and a public/private key pair for communication encryption. These are well-understood standards — Lemitar does not invent new security mechanisms, it relies on existing ones.

#### 2.1.6. Applications

A Lemitar is not a real-world identity document — it is a digital presence. One person can have multiple Lemitars: a work Lemitar, a personal Lemitar, a hobby Lemitar. Each has its own ID, its own Body, its own features. This is by design — humans present different facets of themselves in different contexts, and Lemitar reflects that.

Lemitar is also not limited to individuals. Businesses, organizations, and groups can have Lemitars. The structure works the same way — a domain as ID, a body of features, data ownership. If organizations adopt Lemitar, it strengthens the ecosystem by bringing institutional support and expanding the marketplace of software and features.

### 2.2. Lemitar Body

A Lemitar Body has two dimensions. The first is structural: Body is a collection of software and features that the owner assembles, configures, and manages. The second is representational: Body is how others experience the person. When someone interacts with your Lemitar, they don't feel like they are using two or three of your apps — they feel like they are dealing with *you*, your representative. Body presents as a unified avatar to the outside world.

One piece of software may provide one or more features, and a Body may include one or more pieces of software. The relationship is many-to-many — software and features should not be conflated.

#### 2.2.1. Features as Human Abilities

Features are not arbitrary software categories drawn by developers. They map to human abilities or skills. Chat maps to the ability to converse. Contacts map to the ability to know and remember people. GPS tracking maps to the ability to share one's location. The feature boundaries are drawn by what humans naturally do, not by how software happens to be packaged.

This is why per-feature thinking is natural rather than forced. Human abilities are stable — people will always need to converse, remember others, locate each other. The software serving those abilities is replaceable.

Lemitar Body's core purpose is interaction-oriented features — features that involve communication between Lemitars. Multiple Lemitars interact through paired features, which means protocol-matching: my chat feature talks to your chat feature, my GPS feature talks to your GPS feature.

#### 2.2.2. Owner and Avatar Relationship

The relationship between a Lemitar and its owner ranges from fully manual to authorized automation. The owner may manually control some features (like reading and writing each text message) while authorizing the avatar to automatically handle others (like auto-responding to GPS tracking requests for specific people during specific time windows). The level of automation depends on how advanced the software is and what the owner chooses to authorize.

#### 2.2.3. From Toolbox to Avatar

Before Lemitar, a person and their software are viewed as a person and their toolbox — discrete tools picked up and put down, with the person as the sole integrator carrying context between tools in their own head. No one would say the toolbox "behaves" or has characteristics.

After Lemitar, the framing shifts. Software becomes organs in a body. They share an identifier (the Lemitar ID), share memory (data), and coordinate through protocols. The collection gains properties no single piece has alone — a persistent identity others can reference, the ability to act on the owner's behalf, the ability to respond when the owner isn't present.

The biological analogy is instructive: individual cells perform functions, but a body has characteristics no cell has — identity, autonomy, continuity over time. The leap from "collection of software" to "Lemitar" is that same kind of emergence — a group of organs forming a higher-level organism.

The full significance of this shift remains to be seen. But the framing itself — toolbox to avatar — may reveal characteristics we don't yet see, the same way naming "life" as distinct from "a collection of cells" opened biology as a field.

#### 2.2.4. Applications

Human interaction is mainly two kinds: social and economic/business. A Lemitar functions in both. Social features are the primary domain, but business use cases exist too — for example, GPS tracking where a delivery person can reach someone in real time at a non-postal address like a mountain or beach, or a payment feature that makes person-to-person transactions between even strangers as simple as scanning a code.

Body can also absorb internal features — personal toolbox utilities such as calendars, file converters, or note-taking tools. These are not Lemitar's purpose, but once the framework exists, it is natural to let it manage them as well, when the infrastructure supports it.

In the GenAI era, this becomes especially powerful. GenAI (such as [OpenClaw](https://openclaw.ai/)) can serve as glue between internal and interaction features. For example, when a Lemitar receives a message asking about the owner's schedule tomorrow, and the owner is not around, OpenClaw can read the calendar (an internal feature) and respond on the owner's behalf (an interaction feature) — given that the sender is authorized and OpenClaw has been granted permission in advance. GenAI brings the capability to manage things inside the body and bridge them to the outside.

## 3. Lemitar Behavior

### 3.1. Three Phases of Communication

[Lemina](https://doi.org/10.36227/techrxiv.175339121.11973602) identifies three levels of programming: inside-program, program-to-program, and program-to-program-plus-human. Lemitar operates at the third level — where humans join. Within this level, Lemitar identifies three phases of communication. Phase 1 encompasses Lemina's first two levels — all code-to-code communication, whether inside a program or across programs — since the distinction between them does not matter for social computing. Phases 2 and 3 refine Lemina's third level by recognizing that GenAI can substitute for the human in many situations, creating a distinct middle phase between rigid code and full human involvement.

In social computing, the three phases coexist:

1. **Phase 1 — Code to Code.** Rigid, precise, machine speed. Programs talk to programs with zero tolerance for error — one wrong field, one missing bracket, and the whole exchange fails. This handles the high-frequency, structured bulk of communication. It can never be replaced by the other phases because speed and volume demand it.

2. **Phase 2 — GenAI-Mediated.** Error-tolerant, ambiguity-absorbing. GenAI can interpret malformed messages, natural language, or unexpected input and still extract intent — much like a person reading broken English. It auto-corrects and bridges gaps. Handles low-frequency ambiguous interactions, which is perfectly suited to social computing where such situations don't happen at machine speed.

3. **Phase 3 — Human-in-the-Loop.** Can jump out of the box entirely. A human isn't bound to the channel, the format, or even the medium. They can pick up the phone, walk next door, ask a mutual friend — whatever it takes to fulfill a goal or fix a problem. They also make judgment calls no program or AI can. Handles novel, unprecedented situations — also low-frequency and human speed in social computing.

These phases are complementary, not replacements for each other. Each is irreplaceable for its class of interaction. They represent escalating degrees of flexibility: Phase 1 has zero (follow the spec or fail), Phase 2 is flexible within the channel, Phase 3 is unbounded. In a functioning Lemitar, all three are present simultaneously as a cascade — Phase 1 handles what it can, Phase 2 catches what Phase 1 can't, Phase 3 is the final authority.

### 3.2. Data and Protocol

Body uses data to remember and protocols to communicate. Both are supporting infrastructure in the Lemitar hierarchy — they exist because Body needs them, not as standalone concepts. The three communication phases (Section 3.1) shape how they should be organized — and how they are organized determines whether the Lemitar vision is practically achievable.

#### 3.2.1. Data Legoization

Today, data storage is per software, not per feature. If an app provides chat, contacts, and GPS, all three features' data lives in that app's storage. You can't take just your chat data to a different app while keeping contacts in the original. Data is organized around software boundaries.

Lemitar's vision is that data storage should be per feature — which is to say, per human ability. Your "ability to converse" data belongs to you, not to whichever chat app you use. Your "ability to remember people" data belongs to you, not to whichever contacts app manages them. This decouples features from software, making them composable like Lego blocks. Don't like how App A handles chat? Swap in App B for chat, and it picks up the same chat data. The rest stays untouched.

#### 3.2.2. Protocol Legoization

Just as data should be per feature, protocols should be per feature. If my chat app and your chat app speak the same chat protocol, it doesn't matter that we use different software. Protocol legoization is what makes cross-software interoperability possible — without it, the marketplace is fragmented into incompatible islands. Existing efforts like ActivityPub have achieved cross-server interoperability for specific features, but they operate within federated networks rather than enabling per-feature protocol swapping across independent Lemitars.

#### 3.2.3. The Two Keys

Two keys make Lemitar's ecosystem possible:

1. **ID and data ownership** — the first key. Without it, there is no demand-side freedom. While decentralized identity standards (such as W3C DIDs) and personal data stores (such as Solid) have been proposed, none has made ID and data ownership practical and unified enough for ordinary people to own their digital presence independently of any platform. This is what Lemitar ID solves.

2. **Data and protocol legoization** — the second key. Without it, even if you own your data, it's tangled across software boundaries and can't be moved at the feature level. Per-feature data storage with standard schemas, and per-feature protocols with standard interfaces, make software truly swappable.

The order matters: key 1 is prerequisite to key 2. Ownership without legoization gives freedom to leave but not freedom to mix. Legoization without ownership is meaningless — modular data means little if someone else controls it.

#### 3.2.4. The Marketplace

Zooming out, the marketplace has many people on the demand side shopping for features to compose their Lemitar Body, and many independent vendors (commercial or open source) on the supply side offering software. People pick and choose — this vendor's chat, that vendor's GPS, an open source contacts app. Vendors compete on quality per feature, because data is owned by the person and stored per feature.

#### 3.2.5. Standardization

This marketplace requires coordination. An ISO-like standardization body would name and define:
- **Features** — the human abilities (chat, contacts, GPS tracking, etc.)
- **Data schemas** per feature — how data is stored and structured
- **Protocols** per feature — how Lemitars communicate for that ability
- **A compatibility matrix** — which software products support which features, schemas, and protocols

This body does not need to exist before the marketplace can function. The internet's own standardization (IETF, W3C) formed *during* growth, not before it. The path is organic:

1. **Vision + PoC** — where we are now. This document articulates the idea, Social via Email proves it works.
2. **Independent implementations** — others build their own software inspired by the same principles.
3. **De facto convergence** — common patterns emerge as builders solve the same problems similarly.
4. **Formal standardization** — a body forms to name and codify what the market has already selected.

### 3.3. The Receptionist

Every Lemitar feature is optional — chat, GPS, conversations, any of them. But Receptionist must exist. It is the only mandatory feature. The reasoning is simple: if a person can't say Hi or can't respond to Hi, there is no common ground for any interaction. Receptionist is that baseline.

#### 3.3.1. Capability Disclosure

Receptionist's primary function is to tell others what this Lemitar can do. Think of an office phone system's auto-attendant: "Press 1 for sales. Press 2 for support. Press 5 for fax." Before you try anything, the system lays out the options. Receptionist does the same — it proactively describes the Lemitar's features and how to reach each one, referencing standardized feature names (Section 3.2.5).

Receptionist can also handle general-purpose requests beyond feature discovery. "Could you turn on your GPS tracking?" is not a GPS protocol message — it's a Receptionist-level exchange that might lead to GPS interaction. The best way to think about Receptionist at the communication level is that it is a text channel — like a DM or PM.

#### 3.3.2. Not Always the First Step

Receptionist is the front desk, but you don't always have to go through the front desk. Like dialing a known extension number directly, if Alice already knows Bob supports chat, she can talk directly to Bob's chat feature without going through Receptionist first. But if she doesn't know what Bob supports, or it's a first contact, Receptionist is where she starts.

#### 3.3.3. Three-Phase Entry Point

Because Receptionist is the first contact point of a Lemitar, anything could arrive: a structured envelope, a natural language message, or something entirely unexpected. This makes Receptionist the feature where the three communication phases (Section 3.1) matter most:

- **Phase 1 (code):** A structured envelope arrives requesting the feature list. Coded logic responds automatically. Fast, rigid, routine.
- **Phase 2 (GenAI):** Something arrives that isn't a valid envelope — natural language, a question, an unfamiliar request. GenAI interprets intent and responds meaningfully.
- **Phase 3 (human):** Something truly novel that even GenAI can't resolve. The human owner steps in.

#### 3.3.4. Leaning Toward Real-World Patterns

The office phone analogy is not accidental. Once Lemitar is established, it will naturally evolve toward how humans work and organize in the real world. The patterns will feel familiar — front desks, direct extensions, auto-attendants — because Lemitar mirrors real-world social organization rather than inventing abstract technical constructs. The vision sets the principles, but how Lemitars organize internally will evolve naturally, just as offices developed their own phone trees and routing conventions over time.

## 4. Proof of Concept: Social via Email

[Social via Email](https://github.com/LeminaLLC/social-via-email) demonstrates the Lemitar vision with a working application. It is a fully open-source, client-side social app that uses your email account as both the transport layer and the data store.

Social via Email demonstrates the separation between ID, App, and Storage:

- **ID** — Your email address. The app does not create or own your identification. You bring it.
- **App** — Social via Email itself. Open source, replaceable, runs entirely in the browser. It provides features (contacts, chat, conversations, GPS tracking) but does not hold your identification or data.
- **Storage** — Your own email account. All state is saved as JSON back into your inbox. You own the data.

The app is one piece of software that contributes multiple features to a Lemitar Body. But it is decoupled from both the ID and the storage. The app could be swapped out for a different one, and your ID and data remain yours.

The three communication phases are already visible in the implementation: structured JSON envelopes are Phase 1, the `social-via-email-ai` email label is a deliberate placeholder for Phase 2, and the human owner is Phase 3. The Receptionist feature is implemented at Phase 1 — coded logic handles feature discovery between two instances of the app.

Email is not an ideal data store — this is a demonstration, not a production architecture. A real database would be a more natural fit, but email makes the app intuitive to try and keeps the concepts transparent. You can open your email client and see your data in plain JSON.

## 5. Conclusion

Before Lemitar, a person's digital presence is scattered across platforms they do not own. Existing efforts have addressed pieces of this problem, but no unified path has existed. After Lemitar, the path exists: own your identification through a domain name, compose your digital body from software you choose, and interact with others on your own terms. The ideas are not hypothetical — Social via Email demonstrates that they work. What remains is for others to build on the same principles, and for the ecosystem to grow. The vision is simple: your digital presence should belong to you — and now, for the first time, the technical path to make that real exists.

## Appendix: Prior Art for the Three Phases of Communication

The individual components of the three-phase model (Section 3.1) exist across multiple fields, but no one has assembled them into a unified architectural principle for social computing.

**Closest matches:**
- **Bak-Coleman et al. (2024)** — "Human-machine social systems" identifies three simultaneous interaction types (M-M, H-M, H-H), but frames them as flat peer types rather than layered tiers with different frequency bands.
- **Hancock et al. (2020)** — "AI-Mediated Communication" defines AI as a communication mediator, but only in the human-to-human context — AI enhances messages between people, not as a tier in a protocol stack.
- **Robotics three-layer architecture (Firby et al.)** — Reactive (fast, rigid), plan execution (intermediate), deliberative (slow, flexible). Same structural logic — fast-rigid at bottom, slow-flexible at top — but applied to robot control, not social communication.
- **Postel's Law (1981)** — "Be conservative in what you send, be liberal in what you accept." This model can be read as "Postel's Law, stratified" — the rigid code layer sends precisely, the AI layer receives liberally, as separate layers rather than competing principles within one layer.

**Supporting evidence:**
- **ScienceDirect (2022)** — "Ambiguity can compensate for semantic differences in human-AI communication" demonstrates computationally that moderate ambiguity *improves* cross-agent communication, supporting the idea that Phase 2's error tolerance is a feature, not a bug.
- **Levels of autonomy literature (Sheridan & Verplank, Anthropic)** — Describes escalation from automated to human, but as a continuous spectrum rather than discrete complementary layers.

**The gap this fills:**
- The decentralized social world (ActivityPub/fediverse) uses rigid Phase 1 protocols only.
- The multi-agent AI world (MCP, A2A, Coral Protocol) handles agent coordination but humans are outside the stack.
- Nobody appears to be explicitly bridging these with an AI mediation layer plus human fallback, specifically for social computing between personal digital avatars.

**What appears novel:**
1. GenAI as a named, distinct communication tier — not a tool within another tier, but a layer with its own properties.
2. Frequency as the routing criterion — code handles volume, GenAI and human handle low-frequency, and that's natural for social computing.
3. Complementarity, not replacement — each tier is irreplaceable for its class of interaction.
4. Applied to decentralized social computing and personal avatars — existing literature applies similar thinking to robotics or enterprise middleware, not to social interactions between owned digital presences.
