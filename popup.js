const API_KEY = "AIzaSyCiu4vodpZGgh69O0c00PhnGRuJvjuNdHo";

const LANGUAGES = {
    GERMAN: "de",
    ENGLISH: "en",
    SPANISH: "es",
}

chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
}, async (selection) => {
    document.getElementById("englishText").innerHTML = `English:`;
    document.getElementById("germanText").innerHTML = `Deutsche:`;
    document.getElementById("spanishText").innerHTML = `Español:`;
    document.getElementById("inputText").innerHTML = `This is where the freeform mode will be`;
    const translate = selection[0];
    const lang = await detectLanguage(selection);
    const detectedLang = JSON.parse(lang).data.detections[0][0].language;
    const translations = await getTranslations(translate, detectedLang);
    const english = processTranslationObj(translations.english);
    const german = processTranslationObj(translations.german);
    const spanish = processTranslationObj(translations.spanish);
    document.getElementById("englishText").innerHTML = `English: ${english}`;
    document.getElementById("germanText").innerHTML = `Deutsche: ${german}`;
    document.getElementById("spanishText").innerHTML = `Español: ${spanish}`;
});

function getTranslations(phraseToTranslate, detectedLang) {
    return Promise.all(Object.values(LANGUAGES)
        .map((lang) => {
            return lang === detectedLang
                ? Promise.resolve(phraseToTranslate)
                : getTranslation(phraseToTranslate, lang);
        }))
        .then((translations) => {
            return {
                german : translations[0],
                english: translations[1],
                spanish: translations[2],
            }
        });
}

function getTranslation(translate, lang) {
    return new Promise((res, rej) => {
        const TRANSLATE_REQUEST = `https://translation.googleapis.com/language/translate/v2?q=${translate}&target=${lang}&key=${API_KEY}`;
        const xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.onreadystatechange = () => {
            if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
                res(xmlHttpReq.responseText);
            }
        }
        xmlHttpReq.open("GET", TRANSLATE_REQUEST, true);
        xmlHttpReq.send(null);
    });
}

function detectLanguage(selectionToDetect) {
    return new Promise((res, rej) => {
        const DETECT_REQUEST = `https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}`;
        const xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", DETECT_REQUEST, true);
        xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlHttpReq.onreadystatechange = () => {
            if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
                res(xmlHttpReq.responseText);
            }
        }
        xmlHttpReq.send(`q=${selectionToDetect}`);
    });
}

function processTranslationObj(transObj) {
    try {
        const json = JSON.parse(transObj);
        return json.data.translations[0].translatedText;
    } catch (err) {
        return transObj;
    }
}
