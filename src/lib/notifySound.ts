const LS_SOUND = "tapsoran_admin_sound_enabled";

let audio: HTMLAudioElement | null = null;

export function isSoundEnabled() {
  return localStorage.getItem(LS_SOUND) === "1";
}

export function setSoundEnabled(v: boolean) {
  localStorage.setItem(LS_SOUND, v ? "1" : "0");
}

function getAudio() {
  if (!audio) {
    // Keep file under /public so it's served as /sounds/notify.wav
    audio = new Audio("/sounds/notify.wav");
  }
  return audio;
}

// Must be called from a user gesture (click) once, otherwise browsers may block playback.
export async function primeSound() {
  const a = getAudio();
  try {
    a.currentTime = 0;
    await a.play();
    a.pause();
  } catch {
    // ignore
  }
}

export function playSound() {
  if (!isSoundEnabled()) return;
  const a = getAudio();
  try {
    a.currentTime = 0;
    void a.play();
  } catch {
    // ignore
  }
}
