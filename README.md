# Social via Email

Social via Email demonstrates that a social app doesn't have to own your identity or your data. Your email address is your social ID, your email account is your data store, and Social via Email is just the app — open source and replaceable. See the [Lemitar vision](https://github.com/young-rex/papers/blob/main/Lemitar.md).

*Email is not an ideal data store — this is for demonstration only. A real database would be a more natural fit, but it requires prerequisite setup and makes the app less intuitive to try.*

- **You own your ID** — your email address. No platform-specific username, no account to lose.
- **You own your app** — Social via Email is fully open source (MIT license). Fork it, build your own, or use similar apps from other developers.
- **You own your data** — your contacts, chats, and conversations are stored entirely in your own email account. No one else has access.

If you are new here, we recommend reading through the sections in order — it won't take long! If you are returning, feel free to jump straight to what you need.

<a href="readme-images/landing-page.png"><img src="readme-images/landing-page.png" width="400"></a>

<details>
<summary><h2>1. Running the App</h2></summary>

**Option A: Use the hosted version**

The app is hosted on GitHub Pages directly from this repository's `docs/` folder — what you see is exactly what's in the repo. No installation needed: [https://young-rex.github.io/social-via-email/](https://young-rex.github.io/social-via-email/).

**Option B: Run locally**

If you are more comfortable with source code — to inspect it, modify it, or just prefer that way — clone the repository (or download the ZIP from GitHub — no Git required):

```bash
npm install
npm run dev
```

The app runs at [http://localhost:5173/social-via-email/](http://localhost:5173/social-via-email/).

</details>

<details>
<summary><h2>2. How It Works</h2></summary>

<details>
<summary><h3>2.1. Email as Communication</h3></summary>

Social via Email uses your email account as the transport layer for all social interactions. When you add a contact, send a chat message, or post in a conversation, the app sends an email to the recipient with a structured JSON envelope in the body. When you click **Scan**, the app reads incoming emails, processes the commands in their JSON bodies, updates your in-memory state, and moves the emails to trash. The app has no server — messages go directly between email accounts.

The subject line is `Lemitar::Social-via-Email` — this is not part of the protocol; it is simply how the app distinguishes Social via Email messages from the user's normal emails. The protocol itself is entirely in the JSON body.

Take a look at these emails — the JSON body reveals the protocol and the actual data exchanged between users. Exploring these envelopes is the best way to understand how the app communicates.

*The protocol is intentionally simplified for demonstration purposes — a production system would need versioning, authentication, and error handling beyond what is shown here.*

</details>

<details>
<summary><h3>2.2. Email Organization</h3></summary>

During initialization, the app automatically creates three labels in your email account:

| Label | Purpose |
|---|---|
| `social-via-email-data` | Stores the `memory-dump` email containing your saved state |
| `social-via-email-inbox` | Optional. You can set up an email filter rule to route incoming Lemitar emails here, keeping your regular inbox clean. The app does not require this — it's your choice. |
| `social-via-email-ai` | When Scan encounters emails it cannot parse (malformed JSON, natural language, etc.), it moves them here for a future AI agent or for you to handle manually. |

If you expect a lot of Lemitar traffic, create a filter rule in Gmail (or Outlook) to automatically move emails with subject `Lemitar::Social-via-Email` to the `social-via-email-inbox` label. This keeps your regular inbox clean.

</details>

<details>
<summary><h3>2.3. Email as Your Data Store</h3></summary>

The app's entire state (contacts, chats, conversations) is stored as a single `memory-dump` email in your account. This email is sent from `sve@localhost` — a special address that ensures the email stays internal to your account and goes nowhere.

**Loading state — Initialization only.** When you sign in, the app's initialization step (`loadEmailToState`) reads the `memory-dump` email and loads its JSON body into memory. This is the only time the app sets its internal state from the `memory-dump` email. After that, all changes live in browser memory only, until you explicitly save.

**Saving state — Save only.** Clicking **Save** is the only way to persist your current in-memory state back to a new `memory-dump` email. Because email is immutable, every Save creates a new `memory-dump` email and deletes the previous one. There is only ever one.

You can open this email in Gmail or Outlook and see your data in plain JSON — it's your data, fully transparent.

<a href="readme-images/gmail-memory-dump-list.png"><img src="readme-images/gmail-memory-dump-list.png" width="400"></a> <a href="readme-images/gmail-memory-dump-content.png"><img src="readme-images/gmail-memory-dump-content.png" width="400"></a>

</details>

</details>

<details open>
<summary><h2>3. Getting Started</h2></summary>

<details>
<summary><h3>3.1. Sign In</h3></summary>

Click **Sign in to Gmail** or **Sign in to Outlook**. Both use OAuth 2.0 — a secure, widely adopted protocol that lets you grant the app access to your email account without the app ever knowing your password (see [Section 5](#5-oauth-20-granting-and-revoking-access) for a step-by-step walkthrough). A popup window from Google (or Microsoft) will appear.

The app requests the following permissions:

| Permission | Why the app needs it |
|---|---|
| See your profile info | To identify you — your name, email address, and profile picture become your social identity |
| Read your emails | To scan for incoming messages from other Social via Email users |
| Compose and send emails | To send messages (chats, conversation posts, contact requests) to other users |
| Manage labels | To create and use the three labels (`social-via-email-data`, `-inbox`, `-ai`) that organize the app's emails |
| Move emails | To move processed incoming emails to trash after scanning — the app never permanently deletes any email |

**This is safe.** The app has no server — the OAuth token is short-lived (1 hour), stored only in browser memory, and cleared when you close the tab, refresh, or sign out.

Once you grant permissions, the popup closes and you are signed in.

</details>

<details>
<summary><h3>3.2. Sign-In Initialization</h3></summary>

After sign-in, the app lands on the **Logs** tab and automatically runs initialization:

1. **initializeLabels** — creates (or finds) the three email labels described above
2. **loadEmailToState** — looks for an existing `memory-dump` email to restore your saved state
3. **scanIncomingEmails** — checks for any new incoming messages from other users
4. **deleteSentEmails** — cleans up previously sent Lemitar emails

*Everything initialization creates — the labels and the `memory-dump` email — can be easily removed whenever you decide to move on.*

<a href="readme-images/logs-tab.png"><img src="readme-images/logs-tab.png" width="400"></a>

</details>

<details>
<summary><h3>3.3. Scan and Save Are Manual</h3></summary>

**Scan** and **Save** are both manual actions — except for the initial scan on login. You decide when to check for new messages and when to persist your data. This is by design — you stay in control and can observe exactly what happens.

The orange dot on the **Save** button is a "dirty" indicator — it appears whenever you have unsaved changes in memory. Click **Save** to persist your data. When the dirty indicator is on, the app will prevent you from signing out. However, it can be forcibly exited by closing the tab, refreshing, or letting the session expire — in which case unsaved changes are lost.

It is strongly recommended to keep Social via Email and Gmail (or Outlook) open side by side. Since Scan and Save are manual, you have time to inspect the JSON in the email bodies in your inbox or trash — this is the clearest way to understand the protocol and verify what the app is doing.

**Recommended workflow:**
1. Clear the logs (click **Clear logs**)
2. Perform an action (add a contact, send a chat, etc.)
3. Switch to the **Logs** tab to see what happened
4. Optionally, open your email account to inspect the JSON in the email bodies

</details>

</details>

<details open>
<summary><h2>4. Social Features</h2></summary>

<details>
<summary><h3>4.1. Contacts</h3></summary>

<a href="readme-images/contact-tab-with-dialog.png"><img src="readme-images/contact-tab-with-dialog.png" width="400"></a> <a href="readme-images/contact-tab-list.png"><img src="readme-images/contact-tab-list.png" width="400"></a>

Adding a contact is a multi-step protocol that happens automatically across two rounds of scanning:

1. You click **Add a new contact**, enter their email address, and click **Confirm**
2. The app sends a **Receptionist inquiry** to the recipient — before sending a contact request, it first checks whether the recipient's app exists and what it supports (see [4.1.1](#411-about-the-receptionist) for the concept behind this)
3. Once the recipient's app confirms compatibility, the actual contact request is sent
4. When the recipient runs **Scan**, the request is auto-accepted and a confirmation is sent back
5. When you run **Scan** again, the mutual contact is established — both sides now have each other

This means both users need to **Scan twice** for the contact to be fully added on both sides. "Scan twice" does not mean clicking Scan two times in a row — each Scan only picks up emails that have already arrived. You need to wait for the other side to Scan and reply before your next Scan will find anything new. In practice:

- **Scan** on both sides (round 1) — the Receptionist inquiry and response
- **Scan** on both sides (round 2) — the contact request and acceptance

<details>
<summary><h4>4.1.1. About the Receptionist</h4></summary>

The Receptionist is a concept from the Lemitar vision. In a world where everyone runs their own app — and each app may be built differently, support different features, and speak different protocols — there needs to be a way for two unknown apps to introduce themselves before doing anything meaningful together.

Lemitar proposes that every app should support a common capability called the **Receptionist**. When app A wants to interact with app B, it sends an inquiry to B's Receptionist. The address follows the format `<email>#<feature>`, so the inquiry is targeted and unambiguous. The Receptionist responds with what it supports — similar to how a browser and a web server negotiate content types in HTTP, but at the social app layer.

What makes this more than machine-to-machine (M2M) is the fallback chain. In pure M2M, an unrecognized request is an error. In Lemitar's vision, an unrecognized request moves up a chain:

1. **Coded logic** — the app handles it automatically if it was designed to
2. **GenAI** — handles what the code wasn't written for, interpreting intent intelligently
3. **Human** — the user themselves steps in as the last resort

This means two apps that have never met can still attempt to communicate meaningfully, with graceful degradation all the way to a human decision.

In Social via Email, the Receptionist is demonstrated at tier 1 only — coded logic. When you add a contact, the app sends a Receptionist inquiry to verify the recipient runs a compatible app and to exchange supported features. The `social-via-email-ai` label (see [2.2](#22-email-organization)) is a deliberate placeholder for tier 2 — emails that the coded logic cannot parse are parked there, ready for a future AI agent to handle.

The two-round Scan cost when adding a contact is the direct consequence of this handshake — it is the price of two apps properly introducing themselves before exchanging any social data.

</details>

</details>

<details>
<summary><h3>4.2. Chats</h3></summary>

<a href="readme-images/chats-tab-with-dialog.png"><img src="readme-images/chats-tab-with-dialog.png" width="400"></a> <a href="readme-images/chats-tab-expanded.png"><img src="readme-images/chats-tab-expanded.png" width="400"></a>

Chats are private linear conversations — 1:1 or group. All participants see all messages in chronological order.

Each chat shows who started it, the participants, and the opening message. Click the expand arrow to reveal the full thread with a reply box at the bottom.

To start a chat:
1. Click **Add a new chat** — a dialog appears listing all your contacts with checkboxes
2. Select one or more contacts — selecting one contact creates a private direct message; selecting multiple creates a group chat
3. Type your opening message
4. Click **Confirm** — the message is sent to all selected contacts

To reply in a chat:
1. Click the expand arrow on a chat to see the message thread
2. Type your reply in the text box at the bottom
3. Click **Send**

Your own messages appear right-aligned. Other participants' messages appear on the left with their avatar and name.

To leave a chat:
1. Expand the chat
2. Click **Unsubscribe** — you are removed from the chat and other participants are notified

When someone leaves a chat, the remaining participants retain all messages and the full subscriber list, so the conversation continues uninterrupted — even if the original chat creator leaves.

</details>

<details>
<summary><h3>4.3. Conversations</h3></summary>

<a href="readme-images/conversations-tab-with-dialog.png"><img src="readme-images/conversations-tab-with-dialog.png" width="400"></a> <a href="readme-images/conversations-tab-expanded.png"><img src="readme-images/conversations-tab-expanded.png" width="400"></a>

Conversations are tree-structured threaded discussions. Unlike chats, you can reply to any specific post, creating nested threads — similar to Reddit or forum-style discussions.

To start a conversation:
1. Click **Add a new conversation**
2. Type your post
3. Click **Confirm** — the post is sent to all your contacts (all contacts are automatically added as subscribers)

To reply to a specific post:
1. Expand a conversation to see the thread tree
2. Click **Reply** on the post you want to respond to
3. A popup dialog appears with the quoted post for context
4. Type your reply and click **Confirm**

Unlike chats where there is a single reply box for the whole thread, conversations have a **Reply** button on each individual post, allowing you to branch the discussion at any point.

Replies appear nested under the post they respond to, with visual indentation showing the tree structure.

To leave a conversation:
1. Expand the conversation
2. Click **Unsubscribe** — the conversation and all its posts are removed from your local state, and other participants are notified

When someone leaves a conversation, the remaining participants retain all posts and the full subscriber list, so the discussion continues uninterrupted — even if the original conversation creator leaves.

</details>

</details>

<details>
<summary><h2>5. OAuth 2.0: Granting and Revoking Access</h2></summary>

OAuth 2.0 is a well-known standard — plenty of resources cover it in depth. The walkthroughs below use Gmail. Because Social via Email depends on OAuth 2.0 to function, we include at least one worked example so nothing is left to guesswork. If you use Outlook, the flow is similar — the screens will look different but the steps follow the same pattern.

<details>
<summary><h3>5.1. Granting Access via Sign-In</h3></summary>

**Step 1 — Sign in to your Google account.** Enter your email and password as you normally would. If you have 2-Step Verification enabled, complete that as well. This is standard Google sign-in — the same as signing in to any Google service.

<a href="readme-images/gmail-oauth-1-email.png"><img src="readme-images/gmail-oauth-1-email.png" width="400"></a> <a href="readme-images/gmail-oauth-2-password.png"><img src="readme-images/gmail-oauth-2-password.png" width="400"></a>

<a href="readme-images/gmail-oauth-3-2step.png"><img src="readme-images/gmail-oauth-3-2step.png" width="400"></a>

**Step 2 — "Google hasn't verified this app" warning.** You may see this screen because Social via Email is an open-source project in testing mode and has not gone through Google's app verification process. This is expected. Click **Continue** to proceed.

<a href="readme-images/gmail-oauth-4-unverified.png"><img src="readme-images/gmail-oauth-4-unverified.png" width="400"></a>

**Step 3 — Grant permissions.** Google will show you exactly what Social via Email is asking to access. Review the permissions and click **Continue**.

<a href="readme-images/gmail-oauth-5-profile-consent.png"><img src="readme-images/gmail-oauth-5-profile-consent.png" width="400"></a> <a href="readme-images/gmail-oauth-6-gmail-consent.png"><img src="readme-images/gmail-oauth-6-gmail-consent.png" width="400"></a>

You can click **Learn more** to see the detailed permission breakdown:

<a href="readme-images/gmail-oauth-7-permission-details.png"><img src="readme-images/gmail-oauth-7-permission-details.png" width="400"></a>

Once you click **Continue**, the popup closes and you are signed in.

</details>

<details>
<summary><h3>5.2. Revoking Access When You're Done with the App</h3></summary>

Revoking access is done through your Google account — not through Social via Email itself. It permanently removes the app's permission to access your Gmail. This is something you do once when you have fully decided to stop using the app, not as a routine step after each session — signing out of Social via Email is enough for day-to-day use. To revoke:

1. Go to your [Google Account](https://myaccount.google.com)
2. Click **Third-party apps & services** in the left sidebar
3. Find and click **Social via Email**
4. Review the permissions, then click **Remove all access**

<a href="readme-images/gmail-revoke-home.png"><img src="readme-images/gmail-revoke-home.png" width="400"></a> <a href="readme-images/gmail-revoke-third-party.png"><img src="readme-images/gmail-revoke-third-party.png" width="400"></a>

<a href="readme-images/gmail-revoke-sve-overview.png"><img src="readme-images/gmail-revoke-sve-overview.png" width="400"></a> <a href="readme-images/gmail-revoke-sve-details.png"><img src="readme-images/gmail-revoke-sve-details.png" width="400"></a>

</details>

</details>
