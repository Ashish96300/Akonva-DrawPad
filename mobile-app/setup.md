Expo Go doesn't support React Native Gesture Handler's native gestures — it crashes because RNGH needs native modules that aren't included in Expo Go

step 1- npm install -g eas-cli

Step 2 — Login to Expo account:
basheas login

If you don't have an account, create one at expo.dev — it's free.

Step 3 — Configure EAS in your project:
bashcd mobile-app
eas build:configure
When it asks, select Android.

Step 4 — Add plugin to app.json: (already done)

json{
  "expo": {
    "name": "drawpad-mobile",
    "slug": "drawpad-mobile",
    "plugins": [
      "react-native-gesture-handler"
    ]
  }
}

Step 5 — Build a development client:
basheas build --profile development --platform android

This builds an .apk in the cloud (~10 mins). You'll get a QR code to download and install it directly on your phone.

Step 6 — After installing, start your dev server with:

bashnpx expo start --dev-client

Then open the new app (not Expo Go) on your phone and scan the QR code.
That's it — after this you'll have full native module support including RNGH, Skia, everything.