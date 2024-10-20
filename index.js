//have an input that takes in a country 
//and some text that the user wants to translate 

//given the country go to the country api and look up the country
//with that country select the languages spoken in that country 

//go to the other api and look up the languages they translate
//if any one of the languages spoken in the country are in the languages that can be translated then go ahead and translate
//if not then let the user know that the language cant be translated

const translatedResultDisplay = document.querySelector('.translated'); 
const btn = document.querySelector('#btn');

btn.addEventListener('click', translateText); 

async function getLanguagesAndDisplay() {
  const country = document.querySelector('#country').value;
  const countryData = await fetchFunc(`https://restcountries.com/v3.1/name/${country}?fullText=true`)
  const languageObj = countryData[0].languages;
  const languages = Object.values(languageObj);
  document.querySelector('.langsSpoken').textContent = `Languages spoken in ${country} are ${languages.join(', ')}`; 
  return languages; 
}

async function translateText() {

  const text = document.querySelector('#text').value; 
  const apiLanguagesArray = await fetchFunc(`https://libretranslate.com/languages`);
  const apiLanguages = apiLanguagesArray.map(obj => obj.name); 
  const countryLanguages = await getLanguagesAndDisplay(); 
  const translatableLangs = []; 
 
  for (let lang of countryLanguages) {
    for (let apiLang of apiLanguages) {
      if (lang === apiLang) {
        translatableLangs.push(lang); 
      }
    }
  }

  document.querySelector('.translatableLangs').textContent = translatableLangs.length > 0 ? `can translate to ${translatableLangs.join(', ')}` : 'cant translate to any languages from this country cause api'
 

  for (let lang of translatableLangs) {
    const para = document.createElement('p');
    const translated = await postFetchFunc(text, lang); 
    console.log(translated); 
    para.textContent = translated.translatedText;
  }

}

async function fetchFunc(url){
  try {
    const response = await fetch(url); 
    const data = await response.json(); 
    return data; 
  } catch (error) {
    console.error(error); 
  }
}

async function postFetchFunc(text, target) {
  
  const res = await fetch('https://libretranslate.com/translate', {
    method: 'POST',
    body: JSON.stringify({
      q: text,
      source: 'auto',
      target,
      format: 'text',
      alternatives: 3,
      api_key: '',
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  return await res.json();
}