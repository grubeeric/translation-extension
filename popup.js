const API_KEY = "AIzaSyCiu4vodpZGgh69O0c00PhnGRuJvjuNdHo";
const GERMAN = "de";
const ENGLISH = "en";
const SPANISH = "es";

chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
}, async (selection) => {
    const translate = selection[0];
    const detectedLang = await detectLanguage(selection);
    const lang = JSON.parse(detectedLang).data.detections[0][0].language;
    const transDetails = {
        selectionToTranslate: translate,
        detectedLang: lang
    }
    const translations = await getTranslations(transDetails);
    const english = processTranslationObj(translations.english);
    const german = processTranslationObj(translations.german);
    const spanish = processTranslationObj(translations.spanish);
    document.getElementById("englishText").innerHTML = `English: ${english}`;
    document.getElementById("germanText").innerHTML = `Deutsche: ${german}`;
    document.getElementById("spanishText").innerHTML = `Español: ${spanish}`;
});

async function getTranslations(transDetails) {
    const { selectionToTranslate, detectedLang } = transDetails;
    let totalTranslations = {
        english: undefined,
        spanish: undefined,
        german: undefined
    };
    if (detectedLang === ENGLISH) {
        const german = getTranslation(selectionToTranslate, GERMAN);
        const spanish = getTranslation(selectionToTranslate, SPANISH);
        const translations = await Promise.all([german, spanish]);
        totalTranslations.english = selectionToTranslate;
        totalTranslations.german = translations[0];
        totalTranslations.spanish = translations[1];
        return totalTranslations;
    }
    else if (detectedLang === SPANISH) {
        const german = getTranslation(selectionToTranslate, GERMAN);
        const english = getTranslation(selectionToTranslate, ENGLISH);
        const translations = await Promise.all([german, english]);
        totalTranslations.spanish = selectionToTranslate;
        totalTranslations.german = translations[0];
        totalTranslations.english = translations[1];
        return totalTranslations;
    }
    else {
        const spanish = getTranslation(selectionToTranslate, SPANISH);
        const english = getTranslation(selectionToTranslate, ENGLISH);
        const translations = await Promise.all([spanish, english]);
        totalTranslations.spanish = translations[0];
        totalTranslations.english = translations[1];
        totalTranslations.german = selectionToTranslate;
        return totalTranslations;
    }
}

function getTranslation(selectionToTranslate, lang) {
    return new Promise((res, rej) => {
        const TRANSLATE_REQUEST = `https://translation.googleapis.com/language/translate/v2?q=${selectionToTranslate}&target=${lang}&key=${API_KEY}`;
        let xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.onreadystatechange = function () {
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
        let xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", DETECT_REQUEST, true);
        xmlHttpReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xmlHttpReq.onreadystatechange = function () {
            if (xmlHttpReq.readyState == 4 && xmlHttpReq.status == 200) {
                res(xmlHttpReq.responseText);
            }
        }

        xmlHttpReq.send(`q=${selectionToDetect}`);

    });
}

function processTranslationObj(transObj) {
    try {
        let json = JSON.parse(transObj);
        console.log(json);
        return json.data.translations[0].translatedText;
    } catch (err) {
        console.log(transObj);
        return transObj;
    }
}
