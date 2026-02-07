function ProductCard({ product, onAddToCart, inCart }) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative mb-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
          />
          <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg">
            {product.retailer}
          </span>
        </div>
        
        <h3 className="font-bold text-lg mb-3 line-clamp-2 text-gray-900">
          {product.name}
        </h3>
        
        <div className="text-sm text-gray-600 mb-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📏</span>
            <span>Size: {product.size}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🚚</span>
            <span>{product.delivery_days} day delivery</span>
          </div>
          {product.specs?.waterproof_rating && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">💧</span>
              <span>{product.specs.waterproof_rating}</span>
            </div>
          )}
        </div>
        
        {product.score && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${product.score * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-green-700">
                {Math.round(product.score * 100)}%
              </span>
            </div>
            {product.explanation && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.explanation}
              </p>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ${product.price}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={inCart}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              inCart
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
            }`}
          >
            {inCart ? '✓ In Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    );
  }
  
  export default ProductCard;