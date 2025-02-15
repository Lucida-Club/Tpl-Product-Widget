import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import algoliasearch from 'algoliasearch';
import { Search, MapPin, ShoppingCart, Trash2, Package } from 'lucide-react';
import type { SearchResult } from '../shared/types';
import { setUpc, setSearchResults } from '../store/checkoutSlice';
import type { RootState } from '../store/store';

const client = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_API_KEY
);
const index = client.initIndex(import.meta.env.VITE_ALGOLIA_INDEX_NAME);

function ProductSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const storedUpc = useSelector((state: RootState) => state.checkout.upc);
  const storedResults = useSelector((state: RootState) => state.checkout.searchResults);
  
  const [searchTerm, setSearchTerm] = useState(storedUpc || searchParams.get('upc') || '');
  const [results, setResults] = useState<SearchResult[]>(storedResults);
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState<SearchResult | null>(storedResults[0] || null);

  const formatDistance = (meters: number): string => {
    const miles = meters * 0.000621371;
    return miles.toFixed(1);
  };

  const handleSearch = useCallback(async (upc: string) => {
    if (!upc) {
      setResults([]);
      setProductInfo(null);
      dispatch(setSearchResults([]));
      return;
    }

    setLoading(true);
    try {
      const searchParams = {
        filters: `upc:'${upc}'`,
        hitsPerPage: 20,
        aroundLatLngViaIP: true,
        getRankingInfo: true
      };

      const { hits } = await index.search('', searchParams);
      
      const processedHits = hits.map((hit: any) => ({
        ...hit,
        distance: hit._rankingInfo?.geoDistance || null
      }));
      
      processedHits.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

      setResults(processedHits as SearchResult[]);
      dispatch(setSearchResults(processedHits as SearchResult[]));
      
      if (processedHits.length > 0) {
        setProductInfo(processedHits[0]);
      } else {
        setProductInfo(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setProductInfo(null);
      dispatch(setSearchResults([]));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const upc = searchParams.get('upc');
    if (upc) {
      setSearchTerm(upc);
      dispatch(setUpc(upc));
      handleSearch(upc);
    } else if (storedUpc && !results.length) {
      setSearchTerm(storedUpc);
      setSearchParams({ upc: storedUpc });
      handleSearch(storedUpc);
    }
  }, [searchParams, dispatch, handleSearch, storedUpc, results.length, setSearchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();
    if (trimmedTerm) {
      dispatch(setUpc(trimmedTerm));
      setSearchParams({ upc: trimmedTerm });
      handleSearch(trimmedTerm);
    }
  };

  const handleCheckout = (item: SearchResult) => {
    navigate(`/checkout/${item.objectID}`, { state: { product: item } });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchParams({});
    setResults([]);
    setProductInfo(null);
    dispatch(setUpc(''));
    dispatch(setSearchResults([]));
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter UPC..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                title="Clear search"
              >
                <Trash2 size={20} />
              </button>
            )}
          </form>

          {productInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {productInfo.productName || 'Product Name Not Available'}
                  </h2>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="inline-block mr-4">
                      Category: {productInfo.category || 'N/A'}
                    </span>
                    <span className="inline-block">
                      Brand: {productInfo.vendor || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="hidden sm:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.objectID} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{result.storeName || 'N/A'}</span>
                        <span className="text-xs text-gray-500">{result.objectID}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-1" />
                        {result.distance ? `${formatDistance(result.distance)} miles` : 'Distance unavailable'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleCheckout(result)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <ShoppingCart size={16} className="mr-1" />
                        Checkout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-gray-200">
            {results.map((result) => (
              <div key={result.objectID} className="p-4 hover:bg-gray-50">
                <div className="mb-2">
                  <h3 className="font-medium">{result.storeName || 'N/A'}</h3>
                  <span className="text-xs text-gray-500">{result.objectID}</span>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                    <span className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {result.distance ? `${formatDistance(result.distance)} miles` : 'Distance unavailable'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCheckout(result)}
                  className="w-full mt-2 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <ShoppingCart size={16} className="mr-1" />
                  Checkout
                </button>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              {loading ? 'Searching...' : searchTerm ? 'No results found' : 'Enter a UPC to search'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductSearch;