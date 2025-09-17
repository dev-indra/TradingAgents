'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePortfolio } from '@/context/PortfolioContext'
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import CryptoIcon from './CryptoIcon'

const COLORS = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

interface AssetAllocation {
  name: string
  symbol: string
  value: number
  percentage: number
  color: string
}

export default function PortfolioAnalytics() {
  const { assets, getTotalValue, getTotalCost, getTotalGainLoss } = usePortfolio()

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📈</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Data</h3>
        <p className="text-gray-500">Add assets to your portfolio to see analytics.</p>
      </div>
    )
  }

  const totalValue = getTotalValue()
  
  // Prepare data for charts
  const allocationData: AssetAllocation[] = assets.map((asset, index) => {
    // Use current price if available, fallback to average price
    const currentPrice = asset.currentPrice || asset.averagePrice
    const value = asset.quantity * currentPrice
    return {
      name: asset.name,
      symbol: asset.symbol,
      value,
      percentage: (value / totalValue) * 100,
      color: COLORS[index % COLORS.length]
    }
  }).sort((a, b) => b.value - a.value)

  // Real performance data using live prices
  const performanceData = assets.map((asset, index) => {
    const costBasis = asset.quantity * asset.averagePrice
    // Use current price if available, fallback to average price
    const currentPrice = asset.currentPrice || asset.averagePrice
    const currentValue = asset.quantity * currentPrice
    const unrealizedPnL = currentValue - costBasis
    const percentChange = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0

    return {
      symbol: asset.symbol,
      name: asset.name,
      value: costBasis,
      currentValue: currentValue,
      unrealizedPnL,
      percentChange,
      color: unrealizedPnL >= 0 ? '#22c55e' : '#ef4444',
      priceChange24h: asset.priceChange24h || 0,
      currentPrice,
      averagePrice: asset.averagePrice
    }
  })

  // Use real portfolio calculations from context
  const { amount: totalUnrealizedPnL, percentage: totalPercentChange } = getTotalGainLoss()

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Value */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unrealized P&L</p>
              <p className={`text-2xl font-bold ${totalUnrealizedPnL >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${totalUnrealizedPnL >= 0 ? 'text-success-600' : 'text-danger-600'} flex items-center`}>
                {totalUnrealizedPnL >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(totalPercentChange).toFixed(2)}%
              </p>
            </div>
            <div className={`text-3xl ${totalUnrealizedPnL >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {totalUnrealizedPnL >= 0 ? '📈' : '📉'}
            </div>
          </div>
        </div>

        {/* Asset Count */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assets</p>
              <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
              <p className="text-sm text-gray-500">cryptocurrencies</p>
            </div>
            <div className="text-3xl">🗂️</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Pie Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    'Value'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-2">
            {allocationData.map((item, index) => (
              <div key={item.symbol} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.symbol}</span>
                  <span className="text-gray-500 ml-1">({item.name})</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.percentage.toFixed(1)}%</div>
                  <div className="text-gray-500">${item.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Bar Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="symbol" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
                    'Performance'
                  ]}
                />
                <Bar dataKey="percentChange">
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentChange >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Asset List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Asset Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg / Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.map((asset) => (
                <tr key={asset.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <CryptoIcon 
                          symbol={asset.symbol}
                          name={asset.name}
                          coinGeckoId={assets.find(a => a.symbol === asset.symbol)?.coinGeckoId}
                          iconUrl={assets.find(a => a.symbol === asset.symbol)?.icon}
                          size="lg"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                        <div className="text-sm text-gray-500">{asset.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assets.find(a => a.symbol === asset.symbol)?.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>${assets.find(a => a.symbol === asset.symbol)?.averagePrice.toLocaleString()}</div>
                    {asset.currentPrice && asset.currentPrice !== asset.averagePrice && (
                      <div className={`text-xs ${asset.currentPrice > asset.averagePrice ? 'text-success-600' : 'text-danger-600'}`}>
                        ${asset.currentPrice.toLocaleString()} now
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${asset.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((asset.value / totalValue) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`flex items-center ${asset.unrealizedPnL >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {asset.unrealizedPnL >= 0 ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      <div>
                        <div className="font-medium">
                          {asset.unrealizedPnL >= 0 ? '+' : ''}${asset.unrealizedPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs">
                          {asset.percentChange >= 0 ? '+' : ''}{asset.percentChange.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}