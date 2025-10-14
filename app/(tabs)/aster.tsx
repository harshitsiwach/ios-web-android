import { useTheme } from '@/contexts/ThemeContext';
import { useNetworkSwitcher } from '@/hooks/useNetworkSwitcher';
import { useWallet } from '@/hooks/use-wallet';
import axios from 'axios';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  ActivityIndicator, 
  RefreshControl, 
  StyleSheet, 
  Text, 
  View, 
  TextInput,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useFocusEffect } from 'expo-router';

// Define the market data structures
type Ticker24Hr = {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
};

type OrderBookEntry = [string, string]; // [price, quantity]
type OrderBook = {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
};

// Define coin data structure for display
type CoinData = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
};

const AsterScreen = () => {
  const { colors } = useTheme();
  const { getNetworkName, currentChain, switchToBsc } = useNetworkSwitcher();
  const { isConnected, address } = useWallet();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticker24hrData, setTicker24hrData] = useState<Ticker24Hr[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState('Perpetuals');
  const [selectedCoin, setSelectedCoin] = useState<Ticker24Hr | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'IOC' | 'FOK'>('GTC');
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const coinsPerPage = 15;

  // Using the provided API credentials
  const asterApiKey = 'ea85650ce23a0812e7d7887c75bfa4ac62c29eb278e7f237f08bc677e5a197cf';
  const asterApiSecret = '2664957f7eb62260fd4875998c84bda2f0e46e7a08c80a14318fec2dc4f8c6bc';
  const asterBaseUrl = 'https://fapi.asterdex.com';

  // Switch to appropriate network when this screen is focused
  useFocusEffect(
    useCallback(() => {
      // Aster Perpetual Pro operates on Binance Smart Chain (BSC) which has chain ID 56 (mainnet)
      // If current chain is not BSC, prompt user to switch
      if (currentChain?.id !== 56) { // BSC mainnet chain ID
        Alert.alert(
          'Network Switch Required',
          `Switch from ${getNetworkName(currentChain?.id)} to Binance Smart Chain for Aster DEX?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Switch', 
              onPress: () => {
                switchToBsc();
              }
            }
          ]
        );
      }
    }, [currentChain, getNetworkName, switchToBsc])
  );

  // Fetch 24hr statistics for multiple symbols (includes price and volume)
  const fetchTicker24hr = async () => {
    try {
      const response = await axios.get('https://fapi.asterdex.com/fapi/v1/ticker/24hr');
      setTicker24hrData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching 24hr data:', err);
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch order book for selected coin
  const fetchOrderBook = async (symbol: string) => {
    try {
      // Only attempt to fetch if symbol is valid (not empty)
      if (!symbol) {
        setOrderBook(null);
        return;
      }
      
      const response = await axios.get('https://fapi.asterdex.com/fapi/v1/depth', {
        params: { symbol, limit: 10 }
      });
      setOrderBook(response.data);
    } catch (err: any) {
      console.error('Error fetching order book:', err.message || err);
      setOrderBook(null);
    }
  };

  // Handle coin selection
  const handleCoinSelect = (coin: Ticker24Hr) => {
    setSelectedCoin(coin);
    // Only fetch order book if symbol is valid
    if (coin.symbol && coin.symbol.trim() !== '') {
      fetchOrderBook(coin.symbol);
    } else {
      setOrderBook(null);
    }
    setShowDetailsModal(true);
  };

  // Handle trade button click
  const handleTrade = (side: 'buy' | 'sell') => {
    setTradeSide(side);
    setShowDetailsModal(false);
    // Fetch account info when opening the trade modal
    setTimeout(async () => {
      await fetchAccountInfo();
      setShowTradeModal(true);
    }, 300); // Small delay for better transition
  };

  // Function to generate HMAC-SHA256 signature
  const sign = (query: string, secret: string) => {
    return CryptoJS.HmacSHA256(query, secret).toString(CryptoJS.enc.Hex);
  };

  // Fetch user account information
  const fetchAccountInfo = async () => {
    try {
      const timestamp = Date.now().toString();
      const params = `timestamp=${timestamp}`;
      const signature = sign(params, asterApiSecret);

      const response = await axios.get(
        `${asterBaseUrl}/fapi/v1/account?${params}&signature=${signature}`,
        {
          headers: { 'X-MBX-APIKEY': asterApiKey }
        }
      );

      // Store the full response but also process the USDT balance
      // The response typically has a "assets" array with balances for different tokens
      const accountData = response.data;
      
      // Look for USDT balance in the assets
      if (accountData && Array.isArray(accountData.assets)) {
        const usdtAsset = accountData.assets.find((asset: any) => 
          asset.asset === 'USDT' || asset.asset === 'usdt'
        );
        
        if (usdtAsset) {
          // Add the USDT balance to the account info
          // Use availableBalance for available margin, or walletBalance for total
          accountData.totalWalletBalance = parseFloat(usdtAsset.availableBalance || usdtAsset.walletBalance);
        } else {
          // If no USDT asset found, set balance to 0
          accountData.totalWalletBalance = 0;
        }
      } else if (accountData && accountData.totalWalletBalance !== undefined) {
        // If the response has a totalWalletBalance field directly, use it
        accountData.totalWalletBalance = parseFloat(accountData.totalWalletBalance);
      } else {
        // Default to 0 if no balance information is found
        accountData.totalWalletBalance = 0;
      }
      
      setAccountInfo(accountData);
      return accountData;
    } catch (error) {
      console.error('Error fetching account info:', error);
      return null;
    }
  };

  // Function to transfer funds from wallet to futures account
  const transferFromWalletToFutures = async (asset: string, amount: string) => {
    try {
      const timestamp = Date.now().toString();
      const params = new URLSearchParams({
        asset,
        amount,
        type: '1', // 1 for transfer from spot to futures
        timestamp
      }).toString();
      
      const signature = sign(params, asterApiSecret);

      const response = await axios.post(
        `${asterBaseUrl}/fapi/v1/transfer?${params}&signature=${signature}`,
        null,
        {
          headers: { 'X-MBX-APIKEY': asterApiKey }
        }
      );

      console.log('Transfer response:', response.data);
      // Refresh account info after transfer
      await fetchAccountInfo();
      return response.data;
    } catch (error) {
      console.error('Error transferring funds:', error);
      throw error;
    }
  };

  // Handle placing order
  const handlePlaceOrder = async () => {
    if (!quantity || (orderType === 'LIMIT' && !price)) {
      alert('Please enter quantity and price');
      return;
    }
    
    // Calculate notional value (quantity * price) for validation using same precision as API
    const qty = parseFloat(parseFloat(quantity).toFixed(6));
    const prc = parseFloat(orderType === 'LIMIT' 
      ? parseFloat(price).toFixed(8) 
      : parseFloat(selectedCoin?.lastPrice || '0').toFixed(8));
    const notional = qty * prc;
    
    // Check minimum notional requirement - using 6.0 to be well above the minimum
    if (notional < 6.0) {
      Alert.alert(
        'Order Validation Error',
        `Order notional value must be at least 6.0 USDT.\nCurrent notional: ${notional.toFixed(2)} USDT`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Prepare order parameters with appropriate precision for API
      const timestamp = Date.now().toString();
      
      // Format quantity with appropriate precision
      const formattedQuantity = parseFloat(quantity).toFixed(6);
      
      const paramsObj: any = {
        symbol: selectedCoin?.symbol || '',
        side: tradeSide.toUpperCase(),
        type: orderType,
        quantity: formattedQuantity,
        recvWindow: '5000',
        timestamp
      };

      // Only include price and timeInForce for LIMIT orders
      if (orderType === 'LIMIT' && price) {
        // Format price with appropriate precision
        paramsObj.price = parseFloat(price).toFixed(8);
        paramsObj.timeInForce = timeInForce; // timeInForce is required for LIMIT orders
      }

      const params = new URLSearchParams(paramsObj).toString();

      // Generate signature using the stored API secret
      const signature = sign(params, asterApiSecret);

      // Prepare API request
      const url = `${asterBaseUrl}/fapi/v1/order`;
      const fullUrl = `${url}?${params}&signature=${signature}`;

      // Place the actual order
      const response = await axios.post(fullUrl, null, {
        headers: { 
          'X-MBX-APIKEY': asterApiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('Order response:', response.data);

      // Success message
      Alert.alert(
        'Order Placed Successfully',
        `Your ${tradeSide.toUpperCase()} order for ${quantity} ${selectedCoin?.symbol} has been placed.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and close modal
              setQuantity('');
              setPrice('');
              setShowTradeModal(false);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error placing order:', error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to place order';
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Order Failed',
        `Error: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    fetchTicker24hr();
    // Fetch account info when the component mounts
    fetchAccountInfo();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTicker24hr();
  };

  // Filter coins based on search query and active tab
  const filteredCoins = useMemo(() => {
    let coins = ticker24hrData;
    
    // For "Perpetuals" tab, only show perpetual contracts (typically have funding)
    if (activeTab === 'Perpetuals') {
      coins = ticker24hrData.filter(coin => 
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } 
    // For "Spot" tab, we would filter for spot pairs if available
    else if (activeTab === 'Spot') {
      coins = ticker24hrData.filter(coin => 
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } 
    // For "Favorites", we would implement later if needed
    else {
      coins = ticker24hrData.filter(coin => 
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return coins;
  }, [ticker24hrData, searchQuery, activeTab]);

  // Paginate the coins
  const paginatedCoins = useMemo(() => {
    const startIndex = currentPage * coinsPerPage;
    return filteredCoins.slice(startIndex, startIndex + coinsPerPage);
  }, [filteredCoins, currentPage]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  // Render each coin item
  const renderCoinItem = ({ item }: { item: Ticker24Hr }) => {
    // Ensure values are valid before processing
    const price = item.lastPrice ? parseFloat(item.lastPrice).toString() : '0';
    const volume = item.volume ? parseFloat(item.volume).toString() : '0';
    const changePercent = item.priceChangePercent ? parseFloat(item.priceChangePercent) : 0;
    const isPositive = changePercent >= 0;
    const truncatedSymbol = item.symbol && item.symbol.endsWith('USDT') ? item.symbol.slice(0, -4) : item.symbol || 'N/A';
    
    return (
      <TouchableOpacity 
        style={[styles.coinRow, { backgroundColor: colors.background }]}
        onPress={() => handleCoinSelect(item)}
      >
        <View style={styles.leftColumn}>
          <Text style={[styles.symbolText, { color: colors.text }]}>{truncatedSymbol}</Text>
          <Text style={[styles.volumeText, { color: colors.textSecondary }]}>
            Vol {(parseFloat(volume) * parseFloat(price)).toLocaleString(undefined, { maximumFractionDigits: 0 })} USDT
          </Text>
        </View>
        <View style={styles.middleColumn}>
          <Text style={[styles.priceText, { color: colors.text }]}>{price}</Text>
          <Text style={[styles.usdValue, { color: colors.textSecondary }]}>
            ${parseFloat(price).toFixed(2)}
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={[styles.changeText, { color: isPositive ? colors.up : colors.down }]}>
            {isPositive ? '+' : ''}{item.priceChangePercent}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
    
    if (totalPages <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        <Text style={{ color: colors.textSecondary }}>
          {currentPage + 1} of {totalPages}
        </Text>
        <View style={styles.paginationButtons}>
          <Text 
            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
            style={[styles.paginationButton, { color: currentPage === 0 ? colors.textSecondary : colors.primary }]}
            disabled={currentPage === 0}
          >
            {'<'}
          </Text>
          <Text 
            onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
            style={[styles.paginationButton, { color: currentPage === totalPages - 1 ? colors.textSecondary : colors.primary }]}
            disabled={currentPage === totalPages - 1}
          >
            {'>'}
          </Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading Aster market data...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#F44336' }]}>{error}</Text>
        <Text style={[styles.retryText, { color: colors.primary }]} onPress={fetchTicker24hr}>
          Tap to retry
        </Text>
      </View>
    );
  }

  // Details Modal
  const renderDetailsModal = () => {
    if (!selectedCoin || !showDetailsModal) return null;
    
    // Ensure values are valid before processing
    const price = selectedCoin.lastPrice ? parseFloat(selectedCoin.lastPrice).toString() : '0';
    const volume = selectedCoin.volume ? parseFloat(selectedCoin.volume).toString() : '0';
    const changePercent = selectedCoin.priceChangePercent ? parseFloat(selectedCoin.priceChangePercent) : 0;
    const isPositive = changePercent >= 0;
    const truncatedSymbol = selectedCoin.symbol && selectedCoin.symbol.endsWith('USDT') 
      ? selectedCoin.symbol.slice(0, -4) 
      : selectedCoin.symbol || 'N/A';

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showDetailsModal}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header with market type and navigation */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)} style={styles.backButton}>
              <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.marketType, { color: colors.textSecondary }]}>
              {activeTab}
            </Text>
          </View>
          
          {/* Coin details header */}
          <View style={styles.coinHeader}>
            <Text style={[styles.symbol, { color: colors.text }]}>{truncatedSymbol}</Text>
            <Text style={[styles.price, { color: colors.text }]}>${price}</Text>
            <Text style={[styles.change, { color: isPositive ? colors.up : colors.down }]}>
              {isPositive ? '+' : ''}{selectedCoin.priceChangePercent}%
            </Text>
          </View>
          
          {/* Price chart placeholder */}
          <View style={[styles.chartContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.chartPlaceholder, { color: colors.textSecondary }]}>Price Chart</Text>
          </View>
          
          {/* Buy/Sell buttons */}
          <View style={styles.tradeButtons}>
            <TouchableOpacity 
              style={[styles.tradeButton, styles.buyButton, { backgroundColor: colors.up }]}
              onPress={() => handleTrade('buy')}
            >
              <Text style={styles.tradeButtonText}>Buy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tradeButton, styles.sellButton, { backgroundColor: colors.down }]}
              onPress={() => handleTrade('sell')}
            >
              <Text style={styles.tradeButtonText}>Sell</Text>
            </TouchableOpacity>
          </View>
          
          {/* Market data */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Market Data</Text>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>24h High</Text>
              <Text style={[styles.value, { color: colors.text }]}>{selectedCoin.highPrice || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>24h Low</Text>
              <Text style={[styles.value, { color: colors.text }]}>{selectedCoin.lowPrice || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>24h Volume</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {(parseFloat(volume) * parseFloat(price)).toLocaleString(undefined, { maximumFractionDigits: 0 })} USDT
              </Text>
            </View>
          </View>
          
          {/* Order Book */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Order Book</Text>
            {orderBook ? (
              <View>
                {/* Asks (Sell orders) */}
                <Text style={[styles.orderSide, { color: colors.down, marginBottom: 8 }]}>Asks</Text>
                {orderBook.asks && orderBook.asks.length > 0 ? (
                  orderBook.asks.slice(0, 5).map((ask, index) => (
                    <View key={`ask-${index}`} style={styles.orderRow}>
                      <Text style={[styles.orderPrice, { color: colors.down }]}>{ask[0]}</Text>
                      <Text style={[styles.orderAmount, { color: colors.textSecondary }]}>{ask[1]}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No asks available</Text>
                )}
                
                {/* Bids (Buy orders) */}
                <Text style={[styles.orderSide, { color: colors.up, marginTop: 8, marginBottom: 8 }]}>Bids</Text>
                {orderBook.bids && orderBook.bids.length > 0 ? (
                  orderBook.bids.slice(0, 5).map((bid, index) => (
                    <View key={`bid-${index}`} style={styles.orderRow}>
                      <Text style={[styles.orderPrice, { color: colors.up }]}>{bid[0]}</Text>
                      <Text style={[styles.orderAmount, { color: colors.textSecondary }]}>{bid[1]}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No bids available</Text>
                )}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading order book...</Text>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  // Trade Modal
  const renderTradeModal = () => {
    if (!selectedCoin || !showTradeModal) return null;
    
    const truncatedSymbol = selectedCoin.symbol && selectedCoin.symbol.endsWith('USDT') 
      ? selectedCoin.symbol.slice(0, -4) 
      : selectedCoin.symbol || 'N/A';

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showTradeModal}
        onRequestClose={() => setShowTradeModal(false)}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            {/* Header with market type and navigation */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setShowTradeModal(false);
                setTimeout(() => setShowDetailsModal(true), 300); // Show details again after delay
              }} style={styles.backButton}>
                <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
              </TouchableOpacity>
              <Text style={[styles.marketType, { color: colors.textSecondary }]}>
                {activeTab}
              </Text>
              <View style={{ width: 30 }} /> {/* Spacer for alignment */}
            </View>
            
            {/* Coin info header */}
            <View style={styles.coinHeader}>
              <Text style={[styles.symbol, { color: colors.text }]}>{truncatedSymbol || 'N/A'}</Text>
              <Text style={[styles.price, { color: colors.text }]}>${selectedCoin?.lastPrice || '0.00'}</Text>
            </View>
            
            {/* Order type toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  orderType === 'LIMIT' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setOrderType('LIMIT')}
              >
                <Text style={[
                  styles.toggleText, 
                  orderType === 'LIMIT' && { color: 'white' }
                ]}>
                  LIMIT
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  orderType === 'MARKET' && { backgroundColor: colors.primary }
                ]}
                onPress={() => setOrderType('MARKET')}
              >
                <Text style={[
                  styles.toggleText, 
                  orderType === 'MARKET' && { color: 'white' }
                ]}>
                  MARKET
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Buy/Sell side toggle */}
            <View style={styles.sideToggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.sideToggle, 
                  tradeSide === 'buy' && { backgroundColor: colors.up }
                ]}
                onPress={() => setTradeSide(tradeSide === 'buy' ? 'sell' : 'buy')}
              >
                <Text style={[styles.sideToggleText, tradeSide === 'buy' && { color: 'white' }]}>
                  {tradeSide === 'buy' ? 'BUY' : 'SELL'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Order form */}
            <View style={styles.formContainer}>
              {/* Price input (for LIMIT orders only) */}
              {orderType === 'LIMIT' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Price</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="0.00"
                      placeholderTextColor={colors.textSecondary}
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                    />
                    <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>USDT</Text>
                  </View>
                </View>
              )}
              
              {/* Quantity input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>{truncatedSymbol}</Text>
                </View>
              </View>
              
              {/* Time in force selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Time in Force</Text>
                <View style={styles.selectorContainer}>
                  {['GTC', 'IOC', 'FOK'].map((tif) => (
                    <TouchableOpacity
                      key={tif}
                      style={[
                        styles.selectorButton,
                        timeInForce === tif && { backgroundColor: colors.primary }
                      ]}
                      onPress={() => setTimeInForce(tif as 'GTC' | 'IOC' | 'FOK')}
                    >
                      <Text style={[
                        styles.selectorText,
                        timeInForce === tif && { color: 'white' }
                      ]}>
                        {tif}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Place order button */}
            <TouchableOpacity 
              style={[
                styles.placeOrderButton, 
                { backgroundColor: tradeSide === 'buy' ? colors.up : colors.down }
              ]}
              onPress={handlePlaceOrder}
            >
              <Text style={styles.placeOrderButtonText}>
                {tradeSide === 'buy' ? 'BUY' : 'SELL'} {truncatedSymbol}
              </Text>
            </TouchableOpacity>
            
            {/* Wallet info */}
            <View style={styles.walletInfo}>
              <Text style={[styles.walletLabel, { color: colors.textSecondary }]}>Connected Wallet</Text>
              <Text style={[styles.walletAddress, { color: colors.text }]}>
                {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Not connected'}
              </Text>
              <Text style={[styles.walletLabel, { color: colors.textSecondary, marginTop: 8 }]}>Futures Account Balance</Text>
              <Text style={[styles.walletAddress, { color: colors.text }]}>
                {accountInfo 
                  ? `${(accountInfo.totalWalletBalance ? parseFloat(accountInfo.totalWalletBalance).toFixed(4) : '0.0000')} USDT` 
                  : 'Loading...'}
              </Text>
              
              {/* Transfer funds button */}
              <TouchableOpacity 
                style={[styles.transferButton, { backgroundColor: colors.primary }]}
                onPress={async () => {
                  try {
                    // Example: transfer 10 USDT from wallet to futures
                    // In a real app, you'd want to make this configurable
                    await transferFromWalletToFutures('USDT', '10');
                    Alert.alert('Success', 'Transfer completed successfully!');
                  } catch (error: any) {
                    Alert.alert('Transfer Error', error.message || 'Failed to transfer funds');
                  }
                }}
              >
                <Text style={styles.transferButtonText}>Transfer Funds to Futures</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.cardBackground, 
            color: colors.text,
            borderColor: colors.border,
            borderWidth: 1
          }]}
          placeholder="Search coins..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Balance info */}
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Account Balance</Text>
        <Text style={[styles.balanceValue, { color: colors.text }]}>
          {accountInfo 
            ? `${(accountInfo.totalWalletBalance ? parseFloat(accountInfo.totalWalletBalance).toFixed(4) : '0.0000')} USDT` 
            : 'Connect to view balance'}
        </Text>
      </View>
      
      {/* Header showing selected market type */}
      <View style={styles.marketHeader}>
        <Text style={[styles.marketType, { color: colors.text }]}>
          {activeTab}
        </Text>
      </View>
      
      {/* Tab navigation */}
      <View style={styles.tabContainer}>
        {['Favorites', 'Perpetuals', 'Spot'].map((tab) => (
          <View
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomWidth: 2, borderBottomColor: colors.primary }
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primary : colors.textSecondary }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              {tab}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Column headers */}
      <View style={styles.headerRow}>
        <Text style={[styles.columnHeader, { color: colors.textSecondary, flex: 1 }]}>Name / Vol</Text>
        <Text style={[styles.columnHeader, { color: colors.textSecondary, flex: 1, textAlign: 'right' }]}>Last price</Text>
        <Text style={[styles.columnHeader, { color: colors.textSecondary, flex: 0.7, textAlign: 'right' }]}>24h change</Text>
      </View>
      
      {/* Coin list */}
      <FlatList
        data={paginatedCoins}
        renderItem={renderCoinItem}
        keyExtractor={(item) => item.symbol}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No coins match your search
          </Text>
        }
      />
      
      {/* Pagination controls */}
      {renderPagination()}
      
      {/* Total coins info */}
      <View style={styles.infoContainer}>
        <Text style={{ color: colors.textSecondary }}>
          Showing {paginatedCoins.length} of {filteredCoins.length} coins
        </Text>
      </View>
      
      {/* Details Modal */}
      {renderDetailsModal()}
      
      {/* Trade Modal */}
      {renderTradeModal()}
    </View>
  );
};

export default AsterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  marketHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  marketType: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  coinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 4,
    borderRadius: 8,
  },
  leftColumn: {
    flex: 1,
    marginRight: 8,
  },
  middleColumn: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  rightColumn: {
    flex: 0.7,
    alignItems: 'flex-end',
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  usdValue: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  volumeText: {
    fontSize: 12,
    marginTop: 2,
    color: '#888',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  paginationButtons: {
    flexDirection: 'row',
  },
  paginationButton: {
    fontSize: 18,
    marginHorizontal: 10,
    padding: 5,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  coinHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartContainer: {
    marginVertical: 16,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    fontSize: 16,
  },
  tradeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tradeButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButton: {
    marginRight: 4,
  },
  sellButton: {
    marginLeft: 4,
  },
  tradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderSide: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  orderAmount: {
    fontSize: 14,
    textAlign: 'right',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontWeight: '600',
  },
  sideToggleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sideToggle: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  sideToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputSuffix: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  selectorButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#333',
  },
  selectorText: {
    fontWeight: '500',
  },
  placeOrderButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletInfo: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  walletLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: '500',
  },
  transferButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  transferButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});