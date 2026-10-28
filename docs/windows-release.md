# Windows installer and updates

The assisted NSIS installer is configured in `package.json`. Its four short
feature pages live in `resources/installer.nsh`; this file uses the supported
electron-builder `include` hook, leaving the normal install progress page and
updater/signing path intact. `--updated` skips these introduction pages.
The 24-bit header and sidebar BMPs are regenerated with
`scripts/generate-installer-art.py`. Do not add a separate installer launcher.

`electron-updater` uses the normal NSIS differential path. Do not set
`disableDifferentialDownload`. Each tagged release must publish the installer,
its `.exe.blockmap`, and matching `latest.yml`. The release workflow checks all
three before upload. Keep older release assets available: the updater may need
the installed version's blockmap at its original release URL. A push alone does
not release an update; change the version, build, tag, and publish a valid
GitHub Release. No GitHub token or signing key belongs in the application.

For an A → B test on installed Windows, publish A, install it, then publish B
with a small source change. Check the updater log for `Download block maps`
and the differential downloader's transferred byte count; compare it to the
full B installer size. Temporarily make the old blockmap unavailable in a test
repository to verify the logged full-download fallback, then restore it. Do
not delete production release assets to run this test. Test the upgrade during
a focus session and during adhan: installation must wait until they finish.

The 1.1.0 installer, blockmap, and `latest.yml` were built locally on Windows.
The complete A → B updater test still requires two published GitHub Releases.
