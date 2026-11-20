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

### Experimental local video worker

`apps/worker` is an isolated local-file CLI prototype, not a connected web service. It extracts mono audio in ten-minute chunks, asks Groq Whisper for word timestamps, asks a Groq chat model for candidate moments, and uses FFmpeg to produce center-cropped 720×1280 MP4 clips with burned subtitles and a JSON manifest. It uses a temporary directory and removes it on exit. This is not face tracking. Cloud storage, user authentication, a job queue, durable progress, automatic job retries, multi-provider fallback, and the website download button are **not connected**. Overlapping audio chunks are merged at their midpoint; timing requires end-to-end verification for long recordings. The worker does not download links.

To try locally, install Node 20+, FFmpeg (including libass, libmp3lame and libx264), and configure a Groq key in your shell without committing it. Then run:

```sh
# Set GROQ_API_KEY in your environment first; do not paste keys into source code.
node apps/worker/src/index.mjs /path/to/video.mp4 /path/to/empty-output-directory 3
node --test apps/worker/test/*.test.mjs
```

Models can be changed with `GROQ_TRANSCRIPTION_MODEL` and `GROQ_ANALYSIS_MODEL`. Provider availability and quotas vary, and Groq may not be free for all workloads. Inputs over 1 GB or two hours, clips without word timestamps, and transcripts over 90,000 characters are rejected. The requested Docker image can be built with `docker build -t clipstudio-worker apps/worker`; run it with local input and output volumes and `GROQ_API_KEY` injected via the environment. Neither Docker nor an end-to-end run with a real provider was verified in this environment. Output directories must be empty; a failed run may leave partial output files, which should be removed before retrying.

The requested dedicated Supabase project could not be created because the organization is at its free-project limit. No existing project was changed. Anonymous authentication, cross-device recovery, encrypted key storage and web uploads remain to be implemented after a project slot is available. The worker is not safe to expose as a public job service without authorization, rate limits, storage isolation and queue hardening.
