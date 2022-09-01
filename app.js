/*
  - Construa uma aplicação de conversão de moedas. O HTML e CSS são os que você
    está vendo no browser;
  - Você poderá modificar a marcação e estilos da aplicação depois. No momento, 
    concentre-se em executar o que descreverei abaixo;
    - Quando a página for carregada: 
      - Popule os <select> com tags <option> que contém as moedas que podem ser
        convertidas. "BRL" para real brasileiro, "EUR" para euro, "USD" para 
        dollar dos Estados Unidos, etc.
      - O option selecionado por padrão no 1º <select> deve ser "USD" e o option
        no 2º <select> deve ser "BRL";
      - O parágrafo com data-js="converted-value" deve exibir o resultado da 
        conversão de 1 USD para 1 BRL;
      - Quando um novo número for inserido no input com 
        data-js="currency-one-times", o parágrafo do item acima deve atualizar 
        seu valor;
      - O parágrafo com data-js="conversion-precision" deve conter a conversão 
        apenas x1. Exemplo: 1 USD = 5.0615 BRL;
      - O conteúdo do parágrafo do item acima deve ser atualizado à cada 
        mudança nos selects;
      - O conteúdo do parágrafo data-js="converted-value" deve ser atualizado à
        cada mudança nos selects e/ou no input com data-js="currency-one-times";
      - Para que o valor contido no parágrafo do item acima não tenha mais de 
        dois dígitos após o ponto, você pode usar o método toFixed: 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    - Para obter as moedas com os valores já convertidos, use a Exchange rate 
      API: https://www.exchangerate-api.com/;
      - Para obter a key e fazer requests, você terá que fazer login e escolher
        o plano free. Seus dados de cartão de crédito não serão solicitados.
*/
const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.getElementById('teste')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const convertedPrecision = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]');

const showAlert = (err) => {
  const div = document.createElement("div");
  const button = document.createElement("button");

  div.textContent = err.message;

  div.classList.add(
    "alert",
    "alert-warning",
    "alert-dismissible",
    "fade",
    "show"
  );
  div.setAttribute("role", "alert");

  button.classList.add("btn-close");
  button.setAttribute("type", "button");
  button.setAttribute("aria-label", "Close");

  button.addEventListener("click", () => div.remove());

  div.appendChild(button);
  currenciesEl.insertAdjacentElement("afterend", div);
};

const state = (() => {
  exchangeRate = {}
  return{
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if(!newExchangeRate.conversion_rates){
        showAlert({message:"O objeto precisa ter uma propriedade conversion_rates"});
        return
      }
      exchangeRate = newExchangeRate
      return newExchangeRate
    }

  }
})()


const getUrl = currency =>`https://v6.exchangerate-api.com/v6/e87e2155e9654a749aa77ab0/latest/${currency}`;
// `https://v6.exchangerate-api.com/v6/e87e2155e9654a749aa77ab0/latest/${currencyOneEl.value}`;

const getMessageError = (errorType) =>
  ({
    "unsupported-code":"Código de moeda fornecido não é compatível. (consulte as moedas suportadas)",
    "malformed-request":"Alguma parte da sua solicitação não segue a estrutura mostrada acima.",
    "invalid-key":"A chave da API não é valida.",
    "inactive-account":"Seu endereço de e-mail não foi confirmado.",
    "quota-reached":"Sua conta atingiu  limite de requests permitido em seu plano atual.",
  })[errorType] || "Não foi possível obter as informações."


const fetchExchangeRate = async (url) => { 
  try{
    const response = await fetch(url)
    const exchangeRateData = await response.json()
    
    if(!response.ok){
      
      throw new Error ("Sua conexão falhou. Não foi possível obter as informações.")
    }

    if(exchangeRateData.result === 'error'){
      throw new Error(getMessageError(exchangeRateData['error-type']))
    }
    return state.setExchangeRate(exchangeRateData)
  }catch (err){
    //alert(err.message)
    showAlert(err)
  }
}

const showInitialInfo = ({conversion_rates}) => {
  const getOptions = (selectCurrency) =>
      Object.keys(conversion_rates).map((currency) =>
      `<option ${currency === selectCurrency ? "selected" : ""}>${currency}</option>`).join("");

    currencyOneEl.innerHTML = getOptions("USD");
    currencyTwoEl.innerHTML = getOptions("BRL");

    convertedValueEl.textContent = exchangeRate.conversion_rates.BRL.toFixed(2);
    convertedPrecision.textContent = `1 USD = ${exchangeRate.conversion_rates.BRL} BRL`;
}

const init = async () => {
  const url = getUrl("USD");
  const exchangeRate = await fetchExchangeRate(url);

  if (exchangeRate && exchangeRate.conversion_rates) {
    showInitialInfo(exchangeRate);
  }
}

const getMultipliedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value];
  return (timesCurrencyOneEl.value * currencyTwo).toFixed(2);
}

const getNotRoundedExchangeRate = conversion_rates => {
  const currencyTwo = conversion_rates[currencyTwoEl.value]
  return `1 ${currencyOneEl.value} = ${1 * currencyTwo} ${currencyTwoEl.value}`;
}
 
const showUpdatesRates = ({conversion_rates}) => {
    convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates);
    convertedPrecision.textContent = getNotRoundedExchangeRate(conversion_rates)
  }

  timesCurrencyOneEl.addEventListener('input',() =>{
    const { conversion_rates } = state.getExchangeRate();
    convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates);
  })

currencyTwoEl.addEventListener('input',() =>{
  const exchangeRate = state.getExchangeRate()
  showUpdatesRates(exchangeRate);
})

currencyOneEl.addEventListener('input', async e => {
  const url = getUrl(e.target.value);
  const exchangeRate = await fetchExchangeRate(url);
  showUpdatesRates(exchangeRate);
})

init()