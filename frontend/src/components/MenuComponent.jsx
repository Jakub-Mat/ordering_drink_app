/**
 * Menu component that displays available drinks
 */
export default function MenuComponent({ drinks, selectedDrinks, onToggleDrink }) {
  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Drink Menu</h2>
      
      {drinks.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No drinks available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drinks.map(drink => (
            <button
              key={drink.id}
              onClick={() => onToggleDrink(drink.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedDrinks.includes(drink.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
            >
              <h3 className="text-lg font-bold mb-2">{drink.name}</h3>
              <p className="text-sm text-gray-600">{drink.description || 'No description'}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-sm font-semibold ${
                  selectedDrinks.includes(drink.id) ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {selectedDrinks.includes(drink.id) ? '✓ Selected' : 'Select'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
