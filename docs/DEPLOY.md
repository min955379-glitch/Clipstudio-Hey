# Deployment status

The existing web app on Vercel is a UI prototype; it is not connected to a worker. The Dockerfile in `apps/worker` runs a **local CLI**, not a web server. It cannot be deployed to Hugging Face Spaces or Render as a working processing service in its present form. Do not enter API credentials into a public repository or embed them in images.

To test the current local CLI, see README. To deploy a complete service, first implement authenticated resumable uploads, a queue with cancellation and bounded resource usage, private file access, expiring storage, and a web-to-worker connection. Then create a Docker Space in Hugging Face with a server listening on port 7860, supply secrets using its private settings, and configure the web app to reach the worker. The host's current free limits and availability should be checked before relying on it. This is a future plan, not a copy-paste-ready deployment.
