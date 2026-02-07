import { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import Cart from './components/Cart';
import ProductCard from './components/ProductCard';

function App() {
  const [userIntent, setUserIntent] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleIntentParsed = async (intent) => {
    setUserIntent(intent);
    setLoading(true);
  
    try {
      // Instead of /outfit, use /rank to get ALL ranked products
      const response = await fetch('http://localhost:5000/api/search/rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          filters: {
            size: intent.size,
            maxPrice: intent.budget,
            maxDeliveryDays: intent.delivery_days
          },
          preferences: intent
        })
      });
  
      const data = await response.json();
  
      if (data.success && data.products) {
        // Show top 10 products instead of just the best outfit
        const topProducts = data.products.slice(0, 10);
        setProducts(topProducts);
        
        // Auto-add top-ranked items from each category to cart (within budget)
        const categoriesInCart = new Set();
        const autoCart = [];
        let runningTotal = 0;
        
        for (const product of data.products) {
          // Only add one item per category
          if (!categoriesInCart.has(product.category) && 
              runningTotal + product.price <= intent.budget) {
            autoCart.push(product);
            categoriesInCart.add(product.category);
            runningTotal += product.price;
          }
          
          // Stop if we have all categories or hit budget
          if (categoriesInCart.size >= (intent.items_needed?.length || 5)) {
            break;
          }
        }
        
        setCartItems(autoCart);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!cartItems.find(item => item.id === product.id)) {
      setCartItems([...cartItems, product]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎿</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agentic Ski Shop
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                AI-powered shopping across multiple retailers
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chat Interface - Left Side */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <ChatInterface onIntentParsed={handleIntentParsed} />
            </div>
          </div>

          {/* Products & Cart - Right Side */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Cart Section */}
            <div>
              <Cart
                items={cartItems}
                total={cartTotal}
                onRemove={handleRemoveFromCart}
                userIntent={userIntent}
              />
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Recommended Products
                  </h2>
                  {userIntent && (
                    <p className="text-sm text-gray-500 mt-1">
                      Optimized for ${userIntent.budget} budget • Size {userIntent.size} • {userIntent.delivery_days} day delivery
                    </p>
                  )}
                </div>
                {products.length > 0 && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {products.length} items found
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <p className="mt-4 text-gray-500 font-medium">Finding the best gear for you...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl font-semibold text-gray-900 mb-2">No products yet</p>
                  <p className="text-gray-500">
                    Chat with the assistant to discover skiing gear!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      inCart={cartItems.some(item => item.id === product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;