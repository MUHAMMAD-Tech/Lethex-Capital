import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, ArrowRightLeft, History, Bell, Trash2, DollarSign } from 'lucide-react';

const CURRENCIES = {
  CNY: "人民币",
  USD: "美元",
  EUR: "欧元",
  GBP: "英镑",
  JPY: "日元",
  HKD: "港币",
  AUD: "澳元",
  CAD: "加元",
  CHF: "瑞士法郎",
  SGD: "新加坡元",
  KRW: "韩元",
  TWD: "新台币",
  MYR: "马来西亚林吉特",
  THB: "泰铢",
  VND: "越南盾"
};

const QUICK_AMOUNTS = [100, 1000, 5000, 10000, 50000, 100000];

interface ConversionHistory {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  result: string;
  timestamp: string;
}

function App() {
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>("CNY");
  const [toCurrency, setToCurrency] = useState<string>("USD");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [previousRate, setPreviousRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  const fetchExchangeRate = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const newRate = response.data.rates[toCurrency];
      
      if (previousRate && Math.abs((newRate - previousRate) / previousRate) > 0.02) {
        setNotification(`汇率波动超过2%！从 ${previousRate.toFixed(4)} 变化到 ${newRate.toFixed(4)}`);
      }
      
      setPreviousRate(exchangeRate);
      setExchangeRate(newRate);
      setLastUpdated(new Date().toLocaleTimeString());
      
      const convertedAmount = (parseFloat(amount) * newRate).toFixed(2);
      const historyItem: ConversionHistory = {
        fromCurrency,
        toCurrency,
        amount,
        result: convertedAmount,
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error("获取汇率失败:", error);
      setNotification("获取汇率失败，请稍后重试");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const clearHistory = () => {
    setHistory([]);
    setShowHistory(false);
  };

  const convertedAmount = exchangeRate ? (parseFloat(amount) * exchangeRate).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 text-white p-2 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              货币转换器
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-105"
              title="查看历史记录"
            >
              <History className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={fetchExchangeRate}
              className="p-2 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-105"
              disabled={loading}
              title="刷新汇率"
            >
              <RefreshCw className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-4 bg-yellow-50/80 backdrop-blur border border-yellow-200 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <Bell className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-yellow-700 flex-1">{notification}</span>
            <button
              onClick={() => setNotification("")}
              className="text-yellow-500 hover:text-yellow-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white/50 backdrop-blur p-6 rounded-2xl border border-white/50 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-3">金额</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80"
              placeholder="请输入金额"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map(quickAmount => (
                <button
                  key={quickAmount}
                  onClick={() => handleQuickAmount(quickAmount)}
                  className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  {quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80"
            >
              {Object.entries(CURRENCIES).map(([code, name]) => (
                <option key={code} value={code}>
                  {code} - {name}
                </option>
              ))}
            </select>

            <button
              onClick={handleSwapCurrencies}
              className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-300 transform hover:scale-110"
              title="交换货币"
            >
              <ArrowRightLeft className="w-6 h-6 text-blue-600" />
            </button>

            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80"
            >
              {Object.entries(CURRENCIES).map(([code, name]) => (
                <option key={code} value={code}>
                  {code} - {name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-[1.02]">
            <div className="text-sm opacity-80 mb-2">转换结果</div>
            <div className="text-4xl font-bold mb-2">
              {convertedAmount} {toCurrency}
            </div>
            <div className="text-sm opacity-80 flex items-center gap-2">
              <span>1 {fromCurrency} = {exchangeRate?.toFixed(4)} {toCurrency}</span>
              {previousRate && (
                <span className={`inline-flex items-center ${exchangeRate && exchangeRate > previousRate ? 'text-green-200' : 'text-red-200'}`}>
                  {exchangeRate && exchangeRate > previousRate ? '↑' : '↓'}
                </span>
              )}
            </div>
          </div>

          {showHistory && history.length > 0 && (
            <div className="bg-white/50 backdrop-blur border border-gray-100 rounded-2xl p-6 animate-slideIn">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700">转换历史</h2>
                <button
                  onClick={clearHistory}
                  className="p-2 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                  title="清除历史记录"
                >
                  <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {history.map((item, index) => (
                  <div 
                    key={index} 
                    className="text-sm text-gray-600 p-3 hover:bg-white/80 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {item.amount} {item.fromCurrency} → {item.result} {item.toCurrency}
                      </span>
                      <span className="text-gray-400 text-xs">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastUpdated && (
            <div className="text-xs text-gray-500 text-center animate-pulse">
              最后更新时间: {lastUpdated}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;