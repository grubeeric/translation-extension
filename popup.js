const API_KEY = "AIzaSyCiu4vodpZGgh69O0c00PhnGRuJvjuNdHo";
const GERMAN = "de";
const ENGLISH = "en";
const SPANISH = "es";

chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
}, async (selection) => {
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

async function getTranslations(translate, lang) {
    let totalTranslations = {
        english: undefined,
        spanish: undefined,
        german: undefined
    };
    if (lang === ENGLISH) {
        const german = getTranslation(translate, GERMAN);
        const spanish = getTranslation(translate, SPANISH);
        const translations = await Promise.all([german, spanish]);
        totalTranslations.english = translate;
        totalTranslations.german = translations[0];
        totalTranslations.spanish = translations[1];
    }
    else if (lang === SPANISH) {
        const german = getTranslation(translate, GERMAN);
        const english = getTranslation(translate, ENGLISH);
        const translations = await Promise.all([german, english]);
        totalTranslations.spanish = translate;
        totalTranslations.german = translations[0];
        totalTranslations.english = translations[1];
    }
    else {
        const spanish = getTranslation(translate, SPANISH);
        const english = getTranslation(translate, ENGLISH);
        const translations = await Promise.all([spanish, english]);
        totalTranslations.spanish = translations[0];
        totalTranslations.english = translations[1];
        totalTranslations.german = translate;
    }
    return totalTranslations;
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
