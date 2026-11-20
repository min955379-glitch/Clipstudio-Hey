# Changelog

## Unreleased
- Initial responsive ClipStudio prototype with landing and workspace pages.
- Explicit demo-mode notices for features awaiting backend integration.
- Expanded the studio with source modes, platform choices, caption controls, clip summaries, and dark dropdowns; added browser-local brand preferences and a template preview placeholder.
- Clarified unavailable processing, aligned the default clip count, and added route metadata, search indexing files, and an icon.
- Added illustrative caption previews, browser-only preferences, a support FAQ, and provider information with key entry disabled pending secure implementation.
- Added session-only API key inputs and provider connection tests. Keys are not saved or connected to clipping.
- Added an experimental Dockerized local-file clipping worker and unit tests; it is not connected to the website or cloud storage.
- Added overlapping audio chunk timing, basic file signature checks and media limits to the experimental local worker; clarified the offline upload and link-import states. No hosted processing service is available yet.
- Added an untested, unconnected Supabase persistence schema draft for a future dedicated project; login and permanent storage are not yet available.
