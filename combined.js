<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coin Comparison</title>
    <style>
        .hidden { display: none; }
        .network-icons img.selected { border: 2px solid blue; }
        .details-container, .table-container, .result { margin: 20px 0; }
        .bold-value.increase { color: green; }
        .bold-value.decrease { color: red; }
        .summary-item { margin-bottom: 10px; }
        .tooltip-icon { cursor: pointer; margin-left: 5px; }
        .copyable { cursor: pointer; }
        .comparison-buttons { margin-top: 20px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div id="compareSection" class="hidden">
        <input type="text" id="coin1" onkeyup="showSuggestions('coin1')" onclick="toggleSuggestions('coin1')" placeholder="Select Coin 1">
        <div id="suggestions-coin1" class="hidden"></div>
        <input type="text" id="coin2" onkeyup="showSuggestions('coin2')" onclick="toggleSuggestions('coin2')" placeholder="Select Coin 2">
        <div id="suggestions-coin2" class="hidden"></div>
        <button onclick="compareCoins()">Compare</button>
    </div>
    <div id="comparisonResult"></div>

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
            ethereum: [
                { id: 'ethereum', ticker: 'ETH', name: 'Ethereum', contract: '', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
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
                        <tr><th>Attribute</th><th>Value</th></tr>
                        <tr><td>Name</td><td>${coinData.name}</td></tr>
                        <tr><td>Ticker</td><td>${coinData.symbol.toUpperCase()}</td></tr>
                        <tr><td>Contract Address</td><td class="copyable" data-full-address="${contractAddress}">${shortContractAddress}</td></tr>
                        <tr><td>Market Cap Rank</td><td>${coinData.market_cap_rank || 'N/A'}</td></tr>
                        <tr><td>Genesis Date</td><td>${coinData.genesis_date || 'N/A'}</td></tr>
                        <tr><td>Last Updated</td><td>${lastUpdated}</td></tr>
                        <tr><td>Homepage</td><td><a href="${coinData.links.homepage[0]}" target="_blank">${coinData.links.homepage[0]}</a></td></tr>
                        <tr><td>Official Forum</td><td><a href="${coinData.links.official_forum_url[0]}" target="_blank">${coinData.links.official_forum_url[0]}</a></td></tr>
                    </table>`;
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
                        x: { title: { display: true, text: 'Date' } },
                        y: {
                            title: { display: true, text: 'Market Cap (USD)' },
                            ticks: {
                                callback: function(value) { return '$' + value.toLocaleString(); }
                            }
                        }
                    },
                    plugins: {
                        title: { display: true, text: 'Market Cap Trend Over the Last 7 Days' },
                        tooltip: {
                            callbacks: {
                                label: function(context) { return `$${context.raw.toLocaleString()}`; }
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
                <canvas id="${summaryId}-chart" width="400" height="200"></canvas>`;

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
                            ticks: { stepSize: 1, maxTicksLimit: 10 }
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
                                <tr><th>Metric</th><th>Value</th></tr>
                                <tr><td>1h Price Change</td><td class="bold-value ${coin1PriceChange1h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin1PriceChange1h)}</td></tr>
                                <tr><td>24h Price Change</td><td class="bold-value ${coin1PriceChange24h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin1PriceChange24h)}</td></tr>
                                <tr><td>24h Market Cap Change</td><td class="bold-value ${coin1MarketCapChange24h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin1MarketCapChange24h)}</td></tr>
                                <tr><td>Current Price</td><td class="bold-value">${formatCurrency(parseFloat(coin1CurrentPrice))} USD</td></tr>
                                <tr><td>24h Volume</td><td class="bold-value">${formatCurrency(parseFloat(coin1Volume))}</td></tr>
                                <tr><td>Market Cap</td><td class="bold-value">${formatCurrency(parseFloat(coin1MarketCap))}</td></tr>
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
                                <tr><th>Metric</th><th>Value</th></tr>
                                <tr><td>1h Price Change</td><td class="bold-value ${coin2PriceChange1h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin2PriceChange1h)}</td></tr>
                                <tr><td>24h Price Change</td><td class="bold-value ${coin2PriceChange24h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin2PriceChange24h)}</td></tr>
                                <tr><td>24h Market Cap Change</td><td class="bold-value ${coin2MarketCapChange24h >= 0 ? 'increase' : 'decrease'}">${formatPercentage(coin2MarketCapChange24h)}</td></tr>
                                <tr><td>Current Price</td><td class="bold-value">${formatCurrency(parseFloat(coin2CurrentPrice))} USD</td></tr>
                                <tr><td>24h Volume</td><td class="bold-value">${formatCurrency(parseFloat(coin2Volume))}</td></tr>
                                <tr><td>Market Cap</td><td class="bold-value">${formatCurrency(parseFloat(coin2MarketCap))}</td></tr>
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
</body>
</html>
