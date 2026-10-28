# Prayer location and audio behavior

Prayer times use the vendored PrayTime 3.2 code locally. A location has a name,
latitude, longitude, explicit IANA timezone, last update time, and optional
accuracy. Manual coordinates work without any location service. The automatic
button calls Electron's `navigator.geolocation` only after a user click. Later
refreshes are due every four hours by default, with two-hour and manual-only
options; no continuous tracking or IP location fallback is used. On failure,
the last saved location remains in use and the UI explains that it is stale.
The location remains in the local store and no movement history is collected.

Windows location quality depends on the device and OS provider. GPS accuracy
is never assumed. The application has no geolocation API key and no app-owned
location service. The installed Windows build must still be tested for consent,
availability, accuracy and timezone correctness on target hardware. Verify the
IANA timezone after an automatic fix because the OS device timezone might not
match the physical location.

Adhan files are copied under the application's user-data directory. MP3/WAV
headers, size (up to 20 MB), and actual media decoding are checked before the
copy is accepted. A separate hidden Electron window plays audio with background
throttling disabled, so closing the main window to the tray does not own the
playback. Only one file plays at a time; restarting the application never
resumes an interrupted adhan. A prayer event is persisted before notification
or playback. The allowed late playback window is 90 seconds. Older events are
marked delivered without playing audio. Sunrise never triggers an adhan.

Sound requires the application and device to be running. Windows mute and
output-device choice still apply. The app does not wake the device or change
system volume. A focus session continues through prayer time; its adhan
exception is configurable. Due task reminders are suppressed while adhan
plays. Hearing adhan does not mark a prayer as performed.

Verified locally: prayer calculation and DST unit tests; deduplication,
lateness and focus suppression unit tests; WAV decoding and playback in a
hidden Electron window on Windows. Still requires an installed-build test:
location permission refusal, actual MP3 and WAV user files, output-device
changes, sleep/resume, tray playback and stop, and update installation.
