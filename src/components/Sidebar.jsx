export default function Sidebar({ categories, selectedCategory, setSelectedCategory }) {
  return (
    <div className="w-64 bg-white shadow-lg hidden md:block">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-800">Inventory System</h1>
      </div>
      <nav className="mt-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`block w-full text-left py-3 px-4 hover:bg-blue-50 ${
              selectedCategory === cat.id ? "bg-blue-500 text-white" : ""
            }`}
          >
            {cat.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
