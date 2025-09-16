'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePortfolio } from '@/context/PortfolioContext'
import { ArrowUpIcon, ArrowDownIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const COLORS = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

interface AssetAllocation {
  name: string
  symbol: string
  value: number
  percentage: number
  color: string
}

export default function PortfolioAnalytics() {
  const { assets, getTotalValue } = usePortfolio()

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
    const value = asset.quantity * asset.averagePrice
    return {
      name: asset.name,
      symbol: asset.symbol,
      value,
      percentage: (value / totalValue) * 100,
      color: COLORS[index % COLORS.length]
    }
  }).sort((a, b) => b.value - a.value)

  // Mock performance data (in real app, this would come from price API)
  const performanceData = assets.map((asset, index) => {
    const currentValue = asset.quantity * asset.averagePrice
    // Mock current price change for demo
    const mockPriceChange = (Math.random() - 0.5) * 0.2 // Random -10% to +10%
    const currentPrice = asset.averagePrice * (1 + mockPriceChange)
    const currentTotalValue = asset.quantity * currentPrice
    const unrealizedPnL = currentTotalValue - currentValue
    const percentChange = (unrealizedPnL / currentValue) * 100

    return {
      symbol: asset.symbol,
      name: asset.name,
      value: currentValue,
      currentValue: currentTotalValue,
      unrealizedPnL,
      percentChange,
      color: unrealizedPnL >= 0 ? '#22c55e' : '#ef4444'
    }
  })

  const totalUnrealizedPnL = performanceData.reduce((sum, asset) => sum + asset.unrealizedPnL, 0)
  const totalPercentChange = (totalUnrealizedPnL / totalValue) * 100

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
                  Avg Price
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
                      <div className="text-lg mr-3">
                        {assets.find(a => a.symbol === asset.symbol)?.icon}
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
                    ${assets.find(a => a.symbol === asset.symbol)?.averagePrice.toLocaleString()}
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