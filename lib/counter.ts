const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

export const countdown = async () => {
  for (let i = 5; i > 0; i--) {
    speak(i.toString());
    await sleep(1000);
  }
  speak("スタート");
};

export const speak = (text: string) => {
  if (typeof window === "undefined") return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  // 利用可能な音声リストを取得
  const voices = window.speechSynthesis.getVoices();

  // 例: 日本語かつ「Google 日本語」や「女性」という名前が含まれるものを探す
  // ブラウザによって名前が異なるため、フィルタリングが一般的です
  const targetVoice =
    voices.find(
      (voice) => voice.lang === "ja-JP" && voice.name.includes("Google"), // Google Chromeならより自然な声が多い
    ) || voices.find((voice) => voice.lang === "ja-JP"); // 見つからなければ最初の日本語

  if (targetVoice) {
    utter.voice = targetVoice;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
};
