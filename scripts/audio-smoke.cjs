// A short Windows/Electron media check. Does not use the user's audio or store.
const { app, BrowserWindow } = require('electron')
const { mkdtempSync, writeFileSync, rmSync } = require('fs')
const { tmpdir } = require('os')
const { join } = require('path')
const { pathToFileURL } = require('url')

const dir = mkdtempSync(join(tmpdir(), 'wird-audio-smoke-'))
const wav = join(dir, 'test.wav')
const samples = Buffer.alloc(16000)
const header = Buffer.alloc(44)
header.write('RIFF', 0); header.writeUInt32LE(samples.length + 36, 4)
header.write('WAVEfmt ', 8); header.writeUInt32LE(16, 16)
header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22)
header.writeUInt32LE(8000, 24); header.writeUInt32LE(16000, 28)
header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34)
header.write('data', 36); header.writeUInt32LE(samples.length, 40)
writeFileSync(wav, Buffer.concat([header, samples]))
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { backgroundThrottling: false, webSecurity: true } })
  try {
    await win.loadFile(join(__dirname, '../resources/audio-player.html'))
    const result = await win.webContents.executeJavaScript(`new Promise(resolve => {
      const audio = new Audio(${JSON.stringify(pathToFileURL(wav).href)});
      const timer = setTimeout(() => resolve('timeout'), 5000);
      audio.onerror = () => { clearTimeout(timer); resolve('decode-failed') };
      audio.oncanplay = async () => {
        try { await audio.play(); clearTimeout(timer); resolve('played') }
        catch (error) { clearTimeout(timer); resolve(String(error)) }
      };
      audio.load();
    })`)
    console.log('Wird audio smoke:', result)
    if (process.env.WIRD_AUDIO_SMOKE_RESULT) writeFileSync(process.env.WIRD_AUDIO_SMOKE_RESULT, result)
    process.exitCode = result === 'played' ? 0 : 1
  } catch (error) { console.error(error); process.exitCode = 1 }
  finally { win.destroy(); rmSync(dir, { recursive: true, force: true }); app.quit() }
}).catch(error => { console.error(error); process.exitCode = 1; app.quit() })
