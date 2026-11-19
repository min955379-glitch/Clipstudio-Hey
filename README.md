# ClipStudio

An early, free and open-source creative workspace prototype inspired by the workflow of short-form clipping tools. The original interface is responsive and includes a studio form, project library, templates, brand kit, settings and support placeholders.

No account or sign-in is required to explore the workspace. ClipStudio has no payments or subscription plans. The source is available under the MIT license; operating a hosted video-processing service may still involve infrastructure costs.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Visit http://localhost:3000. `npm run build` and `npm run typecheck` check the web app.

## Current status and limitations

This is a UI prototype, **not a production video clipping service**. Links and files are not submitted or stored; no videos are downloaded, transcribed, analyzed, edited or exported. Server-side project persistence, AI providers, a queue, worker, and encrypted key management have not been implemented. The demo explicitly reports this instead of pretending to create clips. The display-name control saves only to local browser storage. Do not enter API secrets into the demo.

The `.env.example` lists planned integration variables; none are required to run the prototype. Never commit real credentials.

## Next steps

Implement an isolated FFmpeg and faster-whisper worker, a durable queue, secure provider key storage and fallback routing with tests, followed by an accessible editor and actual exports. Keep the experience account-free. Any future hosted storage must protect anonymous users’ data with an explicit security design; anonymous access alone is not a privacy boundary. Verify provider terms and link rights before implementing ingestion. Deploy processing only after security and end-to-end testing.

### Testing provider keys
Settings can test Groq, Gemini, and Cloudflare keys using their model-list APIs. Keys remain in page memory, are sent to the server only for the test, and are cleared on refresh; they are not stored or used for video processing. Cloudflare also needs its account ID. External provider access and a real key are required to test successfully. Do not treat this feature as production-ready key management: encrypted persistence, abuse controls, and the AI pipeline are not implemented.
