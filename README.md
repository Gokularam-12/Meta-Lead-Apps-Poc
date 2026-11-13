# Meta Lead Ads – Real-Time React Native Integration

## Project Overview

This project integrates Meta Lead Ads with a React Native mobile application to receive and display lead information in real time.

When a lead is submitted through a Meta Lead Ads form, Meta sends a webhook notification to the Node.js backend. The backend retrieves the lead details using the Meta Graph API and broadcasts the processed information to connected mobile clients using Socket.IO.

## Architecture

```text
Meta Lead Ads Form
        |
        v
Meta Webhook
        |
        v
Node.js + Express Backend
        |
        v
Meta Graph API
        |
        v
Lead Processing
        |
        v
Socket.IO
        |
        v
React Native Application
        |
        v
Live Leads List
```

## Technology Stack

### Backend
- Node.js
- Express.js
- Socket.IO
- Meta Graph API
- Axios

### Mobile Application
- React Native
- Expo
- Socket.IO Client

### Development Tools
- Meta for Developers
- Meta Lead Ads Testing Tool
- ngrok
- Visual Studio Code

## Project Structure

```text
meta-lead-ads-sync/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── webhook.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   └── constants/
│   │       └── config.ts
│   └── package.json
│
└── README.md
```

*Additional files and folders are part of the implementation.*

## How It Works

1. A user submits a lead through a Meta Lead Ads form.
2. Meta sends a webhook notification to the configured backend endpoint.
3. The backend extracts the Lead ID from the webhook payload.
4. The backend requests the lead details from the Meta Graph API.
5. The retrieved lead information is processed by the backend.
6. Socket.IO broadcasts the new lead to connected mobile clients.
7. The React Native application updates the leads list without requiring manual refresh.

## Configuration

Create a `.env` file inside the backend directory.

```env
PORT=5000
META_VERIFY_TOKEN=your_verify_token
META_PAGE_ACCESS_TOKEN=your_page_access_token
META_GRAPH_API_VERSION=v27.0
```

Never commit actual access tokens or credentials to GitHub.

## Running the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
npm run dev
```

The backend runs on port 5000.

## Exposing the Backend

Use ngrok to expose the local backend to Meta:

```bash
ngrok http 5000
```

Configure the generated HTTPS URL in the Meta Webhooks settings, with `/webhook` as the callback path.

## Running the Mobile Application

Navigate to the mobile directory:

```bash
cd mobile
npm install
npx expo start
```

Open the application using Expo Go or an Android emulator.

Ensure the mobile application uses the correct backend address for its runtime environment.

## Meta Configuration

The Meta application requires:
- A configured Page webhook subscription.
- The `leadgen` webhook field.
- Appropriate lead retrieval permissions.
- A valid Page Access Token.
- A configured callback URL and verification token.

## Security Considerations

- Store access tokens in environment variables.
- Do not expose credentials in source code or logs.
- Keep `.env` excluded from Git.
- Validate incoming webhook requests.
- Handle Graph API errors safely.

## Assumptions

- A Meta Developer application and Facebook Page are configured.
- The Page has an associated Lead Ads form.
- The application has the required permissions and Page access.
- The backend is publicly reachable through HTTPS for webhook delivery.
- The mobile application is connected to the backend through Socket.IO.



## Author

Developed as a Meta Lead Ads and React Native integration project.