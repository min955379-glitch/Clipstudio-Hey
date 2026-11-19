# ClipStudio

An early, free creative workspace prototype inspired by the workflow of short-form clipping tools. The original interface is responsive and includes a studio form, project library, templates, brand kit, settings and support placeholders.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Visit http://localhost:3000. `npm run build` and `npm run typecheck` check the web app.

## Current status and limitations

This is a UI prototype, **not a production video clipping service**. Links and files are not submitted or stored; no videos are downloaded, transcribed, analyzed, edited or exported. Project persistence, authentication, Supabase, AI providers, a queue, worker, encrypted key management, and deployments have not been implemented. The demo explicitly reports this instead of pretending to create clips. The display-name control saves only to local browser storage. Do not enter API secrets into the demo.

The `.env.example` lists planned integration variables; none are required to run the prototype. Never commit real credentials.

## Next steps

Implement authenticated Supabase data and storage with RLS, an isolated FFmpeg and faster-whisper worker, a durable queue, secure provider key storage and fallback routing with tests, followed by accessible editor and actual exports. Verify provider terms and link rights before implementing ingestion. Deploy only after security and end-to-end testing.
