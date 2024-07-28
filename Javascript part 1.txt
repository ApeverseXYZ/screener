<script>
const coins = {
solana: [
{ id: 'popcat', ticker: 'popcat', name: 'Popcat', image: 'https://assets.coingecko.com/coins/images/33760/standard/image.jpg?1702964227' },
{ id: 'dogwifcoin', ticker: 'WIF', name: 'DogWifHat', image: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg?1702499428' },
{ id: 'michicoin', ticker: 'MICHI', name: 'Michi', image: 'https://assets.coingecko.com/coins/images/37309/standard/5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp.jpeg?1713952829' },
{ id: 'zack-morris', ticker: 'ZACK', name: 'Zack Morris', contract: '8vCAUbxejdtaxn6jnX5uaQTyTZLmXALg9u1bvFCAjtx7', image: 'https://raw.githubusercontent.com/ApeverseXYZ/Tracker/main/Zack.png' },
{ id: 'daddy-tate', ticker: 'DADDY', name: 'Daddy Tate', contract: '4Cnk9EPnW5ixfLZatCPJjDB1PUtcRpVVgTQukm9epump', image: 'https://raw.githubusercontent.com/ApeverseXYZ/Tracker/main/Tate.png' },
{ id: 'mother-iggy', ticker: 'MOTHER', name: 'Mother Iggy', contract: '3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN', image: 'https://raw.githubusercontent.com/ApeverseXYZ/Tracker/main/Mother.png' }
],
base: [
{ id: 'based-brett', ticker: 'BRETT', name: 'Brett', contract: '0x592933f8db6ad274e398ff906c5da198d19e6314', image: 'https://raw.githubusercontent.com/ApeverseXYZ/Tracker/main/Brett.png' },
{ id: 'toshi', ticker: 'TOSHI', name: 'Toshi', contract: '0xA91Fbb5433Fb9e7F66ad72f21CAd1E3C7e3cdCC4', image: 'https://raw.githubusercontent.com/ApeverseXYZ/Tracker/main/Toshi.png' }
],
ethereum: [{ id: 'ethereum', ticker: 'ETH', name: 'Ethereum', contract: '', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
{ id: 'uniswap', ticker: 'UNI', name: 'Uniswap', contract: '', image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png' },
{ id: 'chainlink', ticker: 'LINK', name: 'Chainlink', contract: '', image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png' },
{ id: 'matic-network', ticker: 'MATIC', name: 'Polygon', contract: '', image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png' },
{ id: 'maker', ticker: 'MKR', name: 'Maker', contract: '', image: 'https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png' },
{ id: 'filecoin', ticker: 'FIL', name: 'Filecoin', contract: '', image: 'https://assets.coingecko.com/coins/images/12817/large/filecoin.png' },
{ id: 'theta', ticker: 'THETA', name: 'Theta Network', contract: '', image: 'https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png' },
{ id: 'stellar', ticker: 'XLM', name: 'Stellar', contract: '', image: 'https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png' },
{ id: 'compound', ticker: 'COMP', name: 'Compound', contract: '', image: 'https://assets.coingecko.com/coins/images/10775/large/COMP.png' },
{ id: 'algorand', ticker: 'ALGO', name: 'Algorand', contract: '', image: 'https://assets.coingecko.com/coins/images/4380/large/download.png' }
]
};

let selectedNetwork = '';
let chart1 = null;
let chart2 = null;

function filterCoins(network, iconId) {
console.log(`Filtering coins for network: ${network}`);
selectedNetwork = network;
document.getElementById('compareSection').classList.remove('hidden');
document.getElementById('coin1').value = '';
document.getElementById('coin2').value = '';
document.getElementById('suggestions-coin1').innerHTML = '';
document.getElementById('suggestions-coin2').innerHTML = '';
document.getElementById('comparisonResult').innerHTML = '';

document.querySelectorAll('.network-icons img').forEach(img => img.classList.remove('selected'));
document.getElementById(iconId).classList.add('selected');
}

function toggleSuggestions(coinId) {
console.log(`Toggling suggestions for: ${coinId}`);
const suggestionsElement = document.getElementById(`suggestions-${coinId}`);
if (suggestionsElement.classList.contains('hidden')) {
showAllCoins(coinId);
suggestionsElement.classList.remove('hidden');
} else {
suggestionsElement.classList.add('hidden');
}
}

function showAllCoins(coinId) {
console.log(`Showing all coins for: ${coinId}`);
if (!selectedNetwork) return;

const suggestionsElement = document.getElementById(`suggestions-${coinId}`);
let suggestionsHtml = '';

coins[selectedNetwork].forEach(coin => {
suggestionsHtml += `
<div onclick="selectCoin('${coinId}', '${coin.id}', '${coin.ticker}', '${coin.image}')">
<img src="${coin.image}" alt="${coin.name}">
${coin.name} (${coin.ticker})
</div>`;
});

suggestionsElement.innerHTML = suggestionsHtml;
}

function showSuggestions(coinId) {
console.log(`Showing suggestions for: ${coinId}`);
const inputElement = document.getElementById(coinId);
const query = inputElement.value.trim().toLowerCase();
const suggestionsElement = document.getElementById(`suggestions-${coinId}`);

if (query.length < 2 || !selectedNetwork) {
suggestionsElement.innerHTML = '';
return;
}

const filteredCoins = coins[selectedNetwork].filter(coin =>
coin.ticker.toLowerCase().includes(query) || coin.name.toLowerCase().includes(query) || coin.contract.includes(query)
);

let suggestionsHtml = '';
filteredCoins.forEach(coin => {
suggestionsHtml += `
<div onclick="selectCoin('${coinId}', '${coin.id}', '${coin.ticker}', '${coin.image}')">
<img src="${coin.image}" alt="${coin.name}">
${coin.name} (${coin.ticker})
</div>`;
});

suggestionsElement.innerHTML = suggestionsHtml;
}

function selectCoin(coinId, coinIdForAPI, coinTicker, coinImage) {
console.log(`Selecting coin: ${coinId}, ${coinIdForAPI}, ${coinTicker}`);
const inputElement = document.getElementById(coinId);
inputElement.value = `$${coinTicker}`;
inputElement.dataset.coinIdForAPI = coinIdForAPI;
inputElement.dataset.coinImage = coinImage;

inputElement.style.backgroundImage = `url(${coinImage})`;

document.getElementById(`suggestions-${coinId}`).innerHTML = '';
}

function delay(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleDetails(detailsId, tableId, coinId, element) {
const detailsElement = document.getElementById(detailsId);
const tableElement = document.getElementById(tableId);

if (detailsElement.style.display === 'none' || detailsElement.style.display === '') {
detailsElement.style.display = 'block';
tableElement.style.display = 'none';
element.innerHTML = '&#9650;';
fetchAdditionalDetails(detailsId, coinId);
} else {
detailsElement.style.display = 'none';
tableElement.style.display = 'table';
element.innerHTML = '&#9660;';
}
}

async function fetchAdditionalDetails(detailsId, coinId) {
const coinData = await fetchCoinData(coinId);
if (coinData) {
const detailsElement = document.getElementById(detailsId);
const lastUpdated = new Date(coinData.last_updated).toLocaleString();
const contractAddress = coinData.contract_address || 'N/A';
const shortContractAddress = contractAddress.length > 10 ? `${contractAddress.slice(0, 4)}...${contractAddress.slice(-3)}` : contractAddress;

detailsElement.innerHTML = `
<table class="table-container">
<tr>
<th>Attribute</th>
<th>Value</th>
</tr>
<tr>
<td>Name</td>
<td>${coinData.name}</td>
</tr>
<tr>
<td>Ticker</td>
<td>${coinData.symbol.toUpperCase()}</td>
</tr>
<tr>
<td>Contract Address</td>
<td class="copyable" data-full-address="${contractAddress}">${shortContractAddress}</td>
</tr>
<tr>
<td>Market Cap Rank</td>
<td>${coinData.market_cap_rank || 'N/A'}</td>
</tr>
<tr>
<td>Genesis Date</td>
<td>${coinData.genesis_date || 'N/A'}</td>
</tr>
<tr>
<td>Last Updated</td>
<td>${lastUpdated}</td>
</tr>
<tr>
<td>Homepage</td>
<td><a href="${coinData.links.homepage[0]}" target="_blank">${coinData.links.homepage[0]}</a></td>
</tr>
<tr>
<td>Official Forum</td>
<td><a href="${coinData.links.official_forum_url[0]}" target="_blank">${coinData.links.official_forum_url[0]}</a></td>
</tr>
</table>
`;
addCopyFunctionality();
}
}

function addCopyFunctionality() {
const copyableElements = document.querySelectorAll('.copyable');
copyableElements.forEach(element => {
element.onclick = () => {
const address = element.dataset.fullAddress;
navigator.clipboard.writeText(address).then(() => {
alert('Contract address copied to clipboard');
});
};
});
}

async function fetchCoinData(coinIdForAPI) {
console.log(`Fetching coin data for: ${coinIdForAPI}`);
try {
const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinIdForAPI}`);
if (!response.ok) {
throw new Error('Network response was not ok');
}
const data = await response.json();
console.log('Fetched coin data:', data);
return data;
} catch (error) {
console.error('Error fetching coin data:', error);
return null;
}
}

console.log('Script loaded successfully');
</script>