<script>
async function fetchMarketCapHistory(coinId, retryCount = 3) {
console.log(`Fetching market cap history for: ${coinId}`);
const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`;
try {
const response = await fetch(url);
if (!response.ok) {
if (response.status === 429 && retryCount > 0) {
console.warn('Rate limited. Retrying...');
await delay(1000);
return fetchMarketCapHistory(coinId, retryCount - 1);
}
throw new Error('Network response was not ok');
}
const data = await response.json();
return data;
} catch (error) {
console.error('Error fetching market cap history:', error);
return null;
}
}

async function showMarketCapTrend(coinId, chartId) {
console.log(`Showing market cap trend for: ${coinId}`);
const marketCapHistory = await fetchMarketCapHistory(coinId);
if (!marketCapHistory) {
alert('Failed to fetch market cap history. Please try again.');
return;
}

const labels = marketCapHistory.market_caps.map(cap => new Date(cap[0]).toLocaleDateString());
const marketCaps = marketCapHistory.market_caps.map(cap => cap[1]);

const ctx = document.getElementById(chartId).getContext('2d');

if (chartId === 'marketCapTrendChart1' && chart1) {
chart1.destroy();
} else if (chartId === 'marketCapTrendChart2' && chart2) {
chart2.destroy();
}

const chart = new Chart(ctx, {
type: 'line',
data: {
labels: labels,
datasets: [{
label: 'Market Cap (USD)',
data: marketCaps,
borderColor: 'rgba(0, 123, 255, 0.6)',
backgroundColor: 'rgba(0, 123, 255, 0.2)',
fill: true,
tension: 0.1
}]
},
options: {
scales: {
x: {
title: {
display: true,
text: 'Date'
}
},
y: {
title: {
display: true,
text: 'Market Cap (USD)'
},
ticks: {
callback: function(value) {
return '$' + value.toLocaleString();
}
}
}
},
plugins: {
title: {
display: true,
text: 'Market Cap Trend Over the Last 7 Days'
},
tooltip: {
callbacks: {
label: function(context) {
return `$${context.raw.toLocaleString()}`;
}
}
}
}
}
});

if (chartId === 'marketCapTrendChart1') {
chart1 = chart;
} else if (chartId === 'marketCapTrendChart2') {
chart2 = chart;
}
}

function calculateMarketCapMetrics(marketCapHistory) {
const marketCaps = marketCapHistory.market_caps.map(cap => cap[1]);
const changes = [];

for (let i = 1; i < marketCaps.length; i++) {
const change = ((marketCaps[i] - marketCaps[i-1]) / marketCaps[i-1]) * 100;
changes.push(change);
}

const averageChange = changes.reduce((acc, val) => acc + val, 0) / changes.length;
const volatility = Math.sqrt(changes.reduce((acc, val) => acc + Math.pow(val - averageChange, 2), 0) / changes.length);
const totalChange = ((marketCaps[marketCaps.length - 1] - marketCaps[0]) / marketCaps[0]) * 100;
const maxChange = Math.max(...changes);
const minChange = Math.min(...changes);

return {
averageChange: averageChange.toFixed(2),
volatility: volatility.toFixed(2),
totalChange: totalChange.toFixed(2),
maxChange: maxChange.toFixed(2),
minChange: minChange.toFixed(2)
};
}

function createMarketCapIndex(marketCapHistory, summaryId, coinName, coinImage) {
const metrics = calculateMarketCapMetrics(marketCapHistory);
const marketCaps = marketCapHistory.market_caps.map(cap => cap[1]);
const currentMarketCap = marketCaps[marketCaps.length - 1];

const formatPercentage = (value) => {
const formattedValue = value >= 0 ? `+${value}%` : `${value}%`;
const colorClass = value >= 0 ? 'increase' : 'decrease';
return `<span class="${colorClass}">${formattedValue}</span>`;
};

const descriptions = {
totalChange: "The total change in market cap over the last 7 days.",
avgDailyChange: "The average daily percentage change in market cap over the last 7 days.",
volatility: "A measure of how much the market cap fluctuates over the last 7 days.",
maxChange: "The highest percentage increase in market cap in a single day over the last 7 days.",
minChange: "The highest percentage decrease in market cap in a single day over the last 7 days."
};

const indexHtml = `
<h3>Market Cap Index (7d)</h3>
<div style="display: flex; align-items: center;">
<img src="${coinImage}" alt="${coinName}" style="width: 40px; height: 40px; margin-right: 10px;">
<span style="font-size: 1.2em; font-weight: bold;">${coinName}</span>
</div>
<div class="summary-item">
<span class="tooltip-icon" title="${descriptions.totalChange}">?</span>
<span class="label">Total Change:</span>
<span class="value">${formatPercentage(metrics.totalChange)}</span>
</div>
<div class="summary-item">
<span class="tooltip-icon" title="${descriptions.avgDailyChange}">?</span>
<span class="label">Average Daily Change:</span>
<span class="value">${formatPercentage(metrics.averageChange)}</span>
</div>
<div class="summary-item">
<span class="tooltip-icon" title="${descriptions.volatility}">?</span>
<span class="label">Volatility:</span>
<span class="value">${metrics.volatility}%</span>
</div>
<div class="summary-item">
<span class="tooltip-icon" title="${descriptions.maxChange}">?</span>
<span class="label">Highest Daily Change:</span>
<span class="value">${formatPercentage(metrics.maxChange)}</span>
</div>
<div class="summary-item">
<span class="tooltip-icon" title="${descriptions.minChange}">?</span>
<span class="label">Lowest Daily Change:</span>
<span class="value">${formatPercentage(metrics.minChange)}</span>
</div>
<canvas id="${summaryId}-chart" width="400" height="200"></canvas>
`;

document.getElementById(summaryId).innerHTML = indexHtml;

const ctx = document.getElementById(`${summaryId}-chart`).getContext('2d');
new Chart(ctx, {
type: 'bar',
data: {
labels: ['Total Change', 'Avg Daily Change', 'Volatility', 'Max Daily Change', 'Min Daily Change'],
datasets: [{
label: 'Percentage',
data: [metrics.totalChange, metrics.averageChange, metrics.volatility, metrics.maxChange, metrics.minChange],
backgroundColor: [
metrics.totalChange >= 0 ? 'rgba(50, 205, 50, 0.2)' : 'rgba(255, 99, 132, 0.2)',
metrics.averageChange >= 0 ? 'rgba(50, 205, 50, 0.2)' : 'rgba(255, 99, 132, 0.2)',
'rgba(255, 206, 86, 0.2)',
metrics.maxChange >= 0 ? 'rgba(50, 205, 50, 0.2)' : 'rgba(255, 99, 132, 0.2)',
metrics.minChange >= 0 ? 'rgba(50, 205, 50, 0.2)' : 'rgba(255, 99, 132, 0.2)'
],
borderColor: [
metrics.totalChange >= 0 ? 'rgba(50, 205, 50, 1)' : 'rgba(255, 99, 132, 1)',
metrics.averageChange >= 0 ? 'rgba(50, 205, 50, 1)' : 'rgba(255, 99, 132, 1)',
'rgba(255, 206, 86, 1)',
metrics.maxChange >= 0 ? 'rgba(50, 205, 50, 1)' : 'rgba(255, 99, 132, 1)',
metrics.minChange >= 0 ? 'rgba(50, 205, 50, 1)' : 'rgba(255, 99, 132, 1)'
],
borderWidth: 1,
minBarLength: 10 // Ensure bars are always visible
}]
},
options: {
scales: {
y: {
beginAtZero: true,
ticks: {
stepSize: 1,
maxTicksLimit: 10
}
}
},
plugins: {
tooltip: {
callbacks: {
label: function(context) {
return context.dataset.label + ': ' + context.raw + '%';
}
}
}
}
}
});
}

function createComparisonElement(coin1Data, coin2Data, coin1Image, coin2Image) {
console.log('Creating comparison element');
const formatPercentage = (value) => {
if (value !== undefined && value !== null) {
return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
}
return 'N/A';
};

const formatCurrency = (value, symbol = '$') => {
if (typeof value !== 'number') {
return `${symbol}N/A`;
}
if (value >= 1e9) {
return `${symbol}${(value / 1e9).toFixed(2)}B`;
} else if (value >= 1e6) {
return `${symbol}${(value / 1e6).toFixed(2)}M`;
} else if (value >= 1e3) {
return `${symbol}${(value / 1e3).toFixed(2)}K`;
} else if (value < 0.01) {
return `${symbol}${value.toFixed(8)}`;
} else {
return `${symbol}${value.toFixed(2)}`;
}
};

const coin1PriceChange1h = coin1Data.market_data.price_change_percentage_1h_in_currency?.usd ?? null;
const coin2PriceChange1h = coin2Data.market_data.price_change_percentage_1h_in_currency?.usd ?? null;
const coin1PriceChange24h = coin1Data.market_data.price_change_percentage_24h_in_currency?.usd ?? null;
const coin2PriceChange24h = coin2Data.market_data.price_change_percentage_24h_in_currency?.usd ?? null;
const coin1MarketCapChange24h = coin1Data.market_data.market_cap_change_percentage_24h ?? null;
const coin2MarketCapChange24h = coin2Data.market_data.market_cap_change_percentage_24h ?? null;

const coin1CurrentPrice = coin1Data.market_data.current_price?.usd ?? 'N/A';
const coin2CurrentPrice = coin2Data.market_data.current_price?.usd ?? 'N/A';

const coin1MarketCap = coin1Data.market_data.market_cap?.usd ?? 'N/A';
const coin2MarketCap = coin2Data.market_data.market_cap?.usd ?? 'N/A';

const coin1Volume = coin1Data.market_data.total_volume?.usd ?? 'N/A';
const coin2Volume = coin2Data.market_data.total_volume?.usd ?? 'N/A';

const result = `
<div class="result">
<div class="coin-info">
<div>
<h2>
<img src="${coin1Image}" alt="${coin1Data.name}" style="width: 40px; height: 40px; vertical-align: middle;">
${coin1Data.name} (${coin1Data.symbol.toUpperCase()})
<span class="arrow-button" onclick="toggleDetails('coin1Details', 'coin1Table', '${coin1Data.id}', this)">&#9660;</span>
</h2>
<table id="coin1Table" class="table-container">
<tr>
<th>Metric</th>
<th>Value</th>
</tr>
<tr>
<td>1h Price Change</td>
<td class="bold-value ${coin1PriceChange1h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin1PriceChange1h)}</td>
</tr>
<tr>
<td>24h Price Change</td>
<td class="bold-value ${coin1PriceChange24h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin1PriceChange24h)}</td>
</tr>
<tr>
<td>24h Market Cap Change</td>
<td class="bold-value ${coin1MarketCapChange24h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin1MarketCapChange24h)}</td>
</tr>
<tr>
<td>Current Price</td>
<td class="bold-value">${formatCurrency(parseFloat(coin1CurrentPrice))} USD</td>
</tr>
<tr>
<td>24h Volume</td>
<td class="bold-value">${formatCurrency(parseFloat(coin1Volume))}</td>
</tr>
<tr>
<td>Market Cap</td>
<td class="bold-value">${formatCurrency(parseFloat(coin1MarketCap))}</td>
</tr>
</table>
<canvas id="marketCapTrendChart1"></canvas>
<div id="marketCapIndex1" style="text-align: center;"></div>
<div id="coin1Details" class="details-container"></div>
</div>
<div>
<h2>
<img src="${coin2Image}" alt="${coin2Data.name}" style="width: 40px; height: 40px; vertical-align: middle;">
${coin2Data.name} (${coin2Data.symbol.toUpperCase()})
<span class="arrow-button" onclick="toggleDetails('coin2Details', 'coin2Table', '${coin2Data.id}', this)">&#9660;</span>
</h2>
<table id="coin2Table" class="table-container">
<tr>
<th>Metric</th>
<th>Value</th>
</tr>
<tr>
<td>1h Price Change</td>
<td class="bold-value ${coin2PriceChange1h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin2PriceChange1h)}</td>
</tr>
<tr>
<td>24h Price Change</td>
<td class="bold-value ${coin2PriceChange24h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin2PriceChange24h)}</td>
</tr>
<tr>
<td>24h Market Cap Change</td>
<td class="bold-value ${coin2MarketCapChange24h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin2MarketCapChange24h)}</td>
</tr>
<tr>
<td>Current Price</td>
<td class="bold-value">${formatCurrency(parseFloat(coin2CurrentPrice))} USD</td>
</tr>
<tr>
<td>24h Volume</td>
<td class="bold-value">${formatCurrency(parseFloat(coin2Volume))}</td>
</tr>
<tr>
<td>Market Cap</td>
<td class="bold-value">${formatCurrency(parseFloat(coin2MarketCap))}</td>
</tr>
</table>
<canvas id="marketCapTrendChart2"></canvas>
<div id="marketCapIndex2" style="text-align: center;"></div>
<div id="coin2Details" class="details-container"></div>
</div>
</div>
<div class="comparison-buttons">
<button class="mc-comparison-btn" onclick="compareMarketCaps('${coin1Data.name}', ${coin1MarketCap}, '${coin2Data.name}', ${coin2MarketCap})">Compare Market Caps</button>
</div>
<div id="mcComparisonResult"></div>
</div>`;

return result;
}

async function compareCoins() {
console.log('Comparing coins');
const coin1Input = document.getElementById('coin1');
const coin2Input = document.getElementById('coin2');

const coin1GeckoId = coin1Input.dataset.coinIdForAPI;
const coin2GeckoId = coin2Input.dataset.coinIdForAPI;

const coin1Image = coin1Input.dataset.coinImage;
const coin2Image = coin2Input.dataset.coinImage;

if (!coin1GeckoId || !coin2GeckoId) {
alert('Please select valid coins from the suggestions.');
return;
}

const coin1Data = await fetchCoinData(coin1GeckoId);
const coin2Data = await fetchCoinData(coin2GeckoId);

const comparisonResult = createComparisonElement(coin1Data, coin2Data, coin1Image, coin2Image);
document.getElementById('comparisonResult').innerHTML = comparisonResult;

await showMarketCapTrend(coin1Data.id, 'marketCapTrendChart1');
await showMarketCapTrend(coin2Data.id, 'marketCapTrendChart2');

const marketCapHistory1 = await fetchMarketCapHistory(coin1Data.id);
const marketCapHistory2 = await fetchMarketCapHistory(coin2Data.id);

if (marketCapHistory1) {
createMarketCapIndex(marketCapHistory1, 'marketCapSummary1', coin1Data.name, coin1Image);
}
if (marketCapHistory2) {
createMarketCapIndex(marketCapHistory2, 'marketCapSummary2', coin2Data.name, coin2Image);
}

document.getElementById('marketCapSummaryContainer').style.display = 'flex';
}

function compareMarketCaps(coin1Name, coin1MarketCap, coin2Name, coin2MarketCap) {
console.log(`Comparing market caps: ${coin1Name} vs ${coin2Name}`);
let resultText = '';

if (coin1MarketCap > coin2MarketCap) {
const ratio = (coin1MarketCap / coin2MarketCap).toFixed(2);
resultText = `${coin1Name}'s market cap is ${ratio}x greater than ${coin2Name}'s.`;
} else {
const ratio = (coin2MarketCap / coin1MarketCap).toFixed(2);
resultText = `${coin2Name}'s market cap is ${ratio}x greater than ${coin1Name}'s.`;
}

document.getElementById('mcComparisonResult').innerText = resultText;
}

console.log('Script loaded successfully');
</script>