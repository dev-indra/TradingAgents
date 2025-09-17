'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon, CheckIcon, ChartBarIcon, ArrowUpIcon, ArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline'
import { usePortfolio, PortfolioAsset } from '@/context/PortfolioContext'
import PortfolioAnalytics from './PortfolioAnalytics'
import CryptoSearchSelector from './CryptoSearchSelector'
import CryptoIcon from './CryptoIcon'
import { CoinGeckoSearchResult, coinGeckoService } from '@/lib/coingecko'


interface AddAssetFormProps {
  onAdd: (asset: PortfolioAsset) => void
  onCancel: () => void
}

function AddAssetForm({ onAdd, onCancel }: AddAssetFormProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<CoinGeckoSearchResult | null>(null)
  const [formData, setFormData] = useState({
    quantity: '',
    averagePrice: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleCryptoSelect = async (crypto: CoinGeckoSearchResult) => {
    setSelectedCrypto(crypto)
    
    // Optionally fetch current price to suggest as average price
    try {
      setIsLoading(true)
      const coinData = await coinGeckoService.getCoinData(crypto.id)
      if (coinData?.current_price) {
        setFormData(prev => ({ 
          ...prev, 
          averagePrice: coinData.current_price!.toString() 
        }))
      }
    } catch (error) {
      console.error('Failed to fetch current price:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCrypto) return

    const asset: PortfolioAsset = {
      symbol: selectedCrypto.symbol.toUpperCase(),
      name: selectedCrypto.name,
      coinGeckoId: selectedCrypto.id,
      quantity: parseFloat(formData.quantity),
      averagePrice: parseFloat(formData.averagePrice),
      icon: selectedCrypto.large || selectedCrypto.thumb || '',
      addedAt: new Date().toISOString(),
      notes: formData.notes
    }

    onAdd(asset)
    setSelectedCrypto(null)
    setFormData({ quantity: '', averagePrice: '', notes: '' })
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Add Asset to Portfolio</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cryptocurrency
          </label>
          {!selectedCrypto ? (
            <CryptoSearchSelector
              onSelect={handleCryptoSelect}
              placeholder="Search for any cryptocurrency (Bitcoin, Ethereum, Solana...)"
              className="w-full"
            />
          ) : (
            <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CryptoIcon 
                  symbol={selectedCrypto.symbol}
                  name={selectedCrypto.name}
                  coinGeckoId={selectedCrypto.id}
                  iconUrl={selectedCrypto.large || selectedCrypto.thumb}
                  size="lg"
                />
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedCrypto.name} ({selectedCrypto.symbol.toUpperCase()})
                  </div>
                  {selectedCrypto.market_cap_rank && (
                    <div className="text-xs text-gray-500">
                      Rank #{selectedCrypto.market_cap_rank}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCrypto(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              step="any"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              required
              placeholder="e.g., 0.1"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-crypto-500 focus:border-crypto-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Price (USD)
            </label>
            <input
              type="number"
              step="any"
              value={formData.averagePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, averagePrice: e.target.value }))}
              required
              placeholder="e.g., 45000"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-crypto-500 focus:border-crypto-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="e.g., Long-term hold, DCA strategy"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-crypto-500 focus:border-crypto-500"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedCrypto || isLoading || !formData.quantity || !formData.averagePrice}
            className="px-4 py-2 text-sm font-medium text-white bg-crypto-600 border border-transparent rounded-md hover:bg-crypto-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>Add Asset</span>
          </button>
        </div>
      </form>
    </div>
  )
}

interface EditAssetFormProps {
  asset: PortfolioAsset
  onSave: (asset: PortfolioAsset) => void
  onCancel: () => void
}

function EditAssetForm({ asset, onSave, onCancel }: EditAssetFormProps) {
  const [formData, setFormData] = useState({
    quantity: asset.quantity.toString(),
    averagePrice: asset.averagePrice.toString(),
    notes: asset.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedAsset: PortfolioAsset = {
      ...asset,
      quantity: parseFloat(formData.quantity),
      averagePrice: parseFloat(formData.averagePrice),
      notes: formData.notes
    }

    onSave(updatedAsset)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="any"
          value={formData.quantity}
          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
          placeholder="Quantity"
          className="text-sm border-gray-300 rounded focus:ring-crypto-500 focus:border-crypto-500"
        />
        <input
          type="number"
          step="any"
          value={formData.averagePrice}
          onChange={(e) => setFormData(prev => ({ ...prev, averagePrice: e.target.value }))}
          placeholder="Avg Price"
          className="text-sm border-gray-300 rounded focus:ring-crypto-500 focus:border-crypto-500"
        />
      </div>
      <input
        type="text"
        value={formData.notes}
        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        placeholder="Notes"
        className="w-full text-sm border-gray-300 rounded focus:ring-crypto-500 focus:border-crypto-500"
      />
      <div className="flex justify-end space-x-1">
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
        <button
          type="submit"
          className="p-1 text-success-600 hover:text-success-700"
        >
          <CheckIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}

export default function PortfolioManager() {
  const { assets, addAsset, updateAsset, removeAsset, getTotalValue, getTotalCost, getTotalGainLoss, refreshPrices, isLoading, isLoadingPrices, priceError, lastPriceUpdate } = usePortfolio()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'manage' | 'analytics'>('manage')

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const handleAddAsset = (asset: PortfolioAsset) => {
    addAsset(asset)
    setShowAddForm(false)
  }

  const handleEditAsset = (asset: PortfolioAsset) => {
    addAsset(asset) // This will update if it exists
    setEditingAsset(null)
  }

  const totalValue = getTotalValue()
  const totalCost = getTotalCost()
  const { amount: totalGainLoss, percentage: totalGainLossPercent } = getTotalGainLoss()

  const tabs = [
    { id: 'manage', name: 'Manage Portfolio', icon: PlusIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Portfolio Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'manage' | 'analytics')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-crypto-500 text-crypto-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && <PortfolioAnalytics />}
      
      {activeTab === 'manage' && (
        <>
          {/* Portfolio Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">My Portfolio</h2>
              <button
                onClick={() => refreshPrices()}
                disabled={isLoadingPrices}
                className="p-1.5 text-gray-400 hover:text-crypto-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Refresh prices"
              >
                <ClockIcon className={`h-4 w-4 ${isLoadingPrices ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500">Current Value</div>
            {totalGainLoss !== 0 && (
              <div className={`flex items-center justify-end text-sm mt-1 ${totalGainLoss >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {totalGainLoss >= 0 ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="ml-1">({totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%)</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {assets.length} asset{assets.length !== 1 ? 's' : ''} • 
          {lastPriceUpdate ? (
            `Prices updated: ${lastPriceUpdate.toLocaleTimeString()}`
          ) : (
            'Price data loading...'
          )}
          {isLoadingPrices && <span className="ml-2 text-crypto-600">Refreshing...</span>}
        </div>
        
        {/* Price Error Display */}
        {priceError && (
          <div className="bg-danger-50 border border-danger-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <div className="text-danger-800 text-sm">
                <strong>Price Update Failed:</strong> {priceError}
              </div>
              <button
                onClick={() => refreshPrices()}
                disabled={isLoadingPrices}
                className="ml-auto text-sm text-danger-600 hover:text-danger-700 underline disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Add Asset Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 text-gray-600 hover:border-crypto-500 hover:text-crypto-600 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Asset to Portfolio
          </button>
        )}

        {/* Add Asset Form */}
        {showAddForm && (
          <AddAssetForm
            onAdd={handleAddAsset}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>

      {/* Portfolio Assets */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Assets</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {assets.map((asset) => {
            const isEditing = editingAsset === asset.symbol
            const costBasis = asset.quantity * asset.averagePrice
            const currentPrice = asset.currentPrice || asset.averagePrice
            const currentValue = asset.quantity * currentPrice
            const gainLoss = currentValue - costBasis
            const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

            return (
              <div key={asset.symbol} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CryptoIcon 
                      symbol={asset.symbol}
                      name={asset.name}
                      coinGeckoId={asset.coinGeckoId}
                      iconUrl={asset.icon}
                      size="xl"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {asset.name} ({asset.symbol})
                      </div>
                      {asset.notes && (
                        <div className="text-sm text-gray-500">{asset.notes}</div>
                      )}
                      {asset.priceChange24h && (
                        <div className={`flex items-center text-xs mt-1 ${asset.priceChange24h >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                          {asset.priceChange24h >= 0 ? (
                            <ArrowUpIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 mr-1" />
                          )}
                          {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}% (24h)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {isEditing ? (
                      <EditAssetForm
                        asset={asset}
                        onSave={handleEditAsset}
                        onCancel={() => setEditingAsset(null)}
                      />
                    ) : (
                      <>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {asset.quantity} {asset.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            @ ${asset.averagePrice.toLocaleString()} avg
                          </div>
                          {asset.currentPrice && asset.currentPrice !== asset.averagePrice && (
                            <div className="text-xs text-crypto-600">
                              ${asset.currentPrice.toLocaleString()} now
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {((currentValue / totalValue) * 100).toFixed(1)}%
                          </div>
                          {gainLoss !== 0 && (
                            <div className={`text-xs flex items-center justify-end ${gainLoss >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                              {gainLoss >= 0 ? (
                                <ArrowUpIcon className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDownIcon className="h-3 w-3 mr-1" />
                              )}
                              {gainLoss >= 0 ? '+' : ''}${Math.abs(gainLoss).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingAsset(asset.symbol)}
                            className="p-1 text-gray-400 hover:text-crypto-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeAsset(asset.symbol)}
                            className="p-1 text-gray-400 hover:text-danger-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {assets.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-lg font-medium mb-1">No assets in portfolio</div>
              <div className="text-sm">Add your first crypto asset to get started</div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}
