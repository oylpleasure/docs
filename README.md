# Hand Gesture Camera Prototype

Mobile-first, full-screen web app that opens your phone camera and detects two gestures in real-time: thumbs up and fist. Built with MediaPipe Tasks (Hand Landmarker) and deployable to Netlify as a static site.

## Run locally
Use a simple static server (required for camera permissions):

```
cd app
python3 -m http.server 5173
```

Then open `http://localhost:5173`.

## Deploy to Netlify
With Netlify CLI:

```
npm i -g netlify-cli
netlify login
netlify deploy --dir=app --message "gesture prototype"
# optional production
netlify deploy --prod --dir=app
```

Or drag-and-drop the `app/` folder in the Netlify UI. Camera runs over HTTPS on your draft/production URL.

## Notes
- On iOS Safari, ensure camera permission is allowed in Settings if blocked.
- Detection is heuristic-based for a quick prototype; lighting and pose affect accuracy.
