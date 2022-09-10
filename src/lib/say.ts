const speech = new SpeechSynthesisUtterance();

// Set to your language code
speech.lang = "en";

const say = (text: string) => {
    speech.text = text;
    window.speechSynthesis.speak(speech);
};

export default say;
