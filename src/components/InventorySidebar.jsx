// import React, { useState, useEffect } from "react";
// import {
//   FiPlus,
//   FiPackage,
//   FiMenu,
//   FiX,
//   FiTrendingUp,
//   FiBarChart,
// } from "react-icons/fi";
// import CategoryModal from "./CategoryModal";
// import ScrollableCategoryList from "./ScrollableCategoryList";

// const InventorySidebar = ({
//   categories,
//   selectedCategory,
//   onCategorySelect,
//   onCategoryAdded,
//   isSuperAdmin,
//   onAddItem,
//   stats,
// }) => {
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

//   const handleCategoryAdded = () => {
//     onCategoryAdded();
//     setIsCategoryModalOpen(false);
//   };

//   const toggleMobileMenu = () => {
//     setIsMobileOpen(!isMobileOpen);
//   };

//   return (
//     <>
//       {/* Mobile Menu Button - Better positioned */}
//       <div className="lg:hidden fixed top-16 left-4 z-50">
//         <button
//           onClick={toggleMobileMenu}
//           className="btn btn-circle btn-primary shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 border-0"
//         >
//           {isMobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
//         </button>
//       </div>

//       {/* Mobile Sidebar - Full Height with Scrollable Categories */}
//       <div
//         className={`
//           fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
//           ${
//             isMobileOpen
//               ? "translate-x-0"
//               : "-translate-x-full lg:translate-x-0"
//           }
//           lg:h-full h-screen
//         `}
//       >
//         <div className="flex flex-col h-full">
//           {/* Header - Fixed */}
//           <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
//             <div className="flex justify-between items-center">
//               <h2 className="text-base font-bold text-white">Categories</h2>
//               {isSuperAdmin && (
//                 <button
//                   onClick={() => {
//                     setIsCategoryModalOpen(true);
//                     setIsMobileOpen(false);
//                   }}
//                   className="btn bg-white/20 text-white hover:bg-white/30 btn-sm transition-colors border-0 backdrop-blur-sm"
//                   title="Add Category"
//                 >
//                   <FiPlus size={14} />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Selected Category Display - Fixed */}
//           {selectedCategory && (
//             <div className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 bott">
//               <div className="flex items-center space-x-2">
//                 <div className="flex-shrink-0">
//                   <div className="bg-blue-100 p-1 rounded-lg">
//                     <FiPackage size={14} className="text-blue-600" />
//                   </div>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-semibold text-gray-900 capitalize text-sm">
//                     {selectedCategory}
//                   </h3>
//                   <p className="text-xs text-blue-600">
//                     {categories.find((cat) => cat.id === selectedCategory)
//                       ?.itemCount || 0}{" "}
//                     items
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Categories List - Scrollable (Mobile & Desktop) */}
//           <div className="flex-1 min-h-0 overflow-hidden">
//             <div
//               className="h-full"
//               tabIndex={0}
//               onMouseEnter={(e) => {
//                 e.currentTarget.focus();
//               }}
//             >
//               <ScrollableCategoryList
//                 categories={categories}
//                 selectedCategory={selectedCategory}
//                 onCategorySelect={(categoryId) => {
//                   onCategorySelect(categoryId);
//                   setIsMobileOpen(false); // Close mobile menu on selection
//                 }}
//                 isSuperAdmin={isSuperAdmin}
//                 showStats={false}
//                 maxHeight="calc(100vh - 300px)"
//                 className="h-full"
//               />
//             </div>
//           </div>

//           {/* Stats Display - Fixed at bottom */}
//           <div className="flex-shrink-0 p-3 bg-gradient-to-r from-slate-50 to-blue-50/50 border-t border-blue-100/50">
//             <div className="flex items-center justify-between space-x-2">
//               <div className="flex-1 text-center">
//                 <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg text-white mb-1 inline-block">
//                   <FiPackage size={16} />
//                 </div>
//                 <h3 className="font-bold text-gray-900 text-sm">
//                   {categories.length}
//                 </h3>
//                 <p className="text-xs text-gray-600">Categories</p>
//               </div>

//               <div className="flex-1 text-center">
//                 <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1.5 rounded-lg text-white mb-1 inline-block">
//                   <FiTrendingUp size={12} />
//                 </div>
//                 <p className="font-bold text-gray-900 text-sm">
//                   {stats.totalItems}
//                 </p>
//                 <p className="text-xs text-gray-600">Items</p>
//               </div>

//               <div className="flex-1 text-center">
//                 <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-lg text-white mb-1 inline-block">
//                   <FiBarChart size={12} />
//                 </div>
//                 <p className="font-bold text-gray-900 text-sm">
//                   ${stats.totalValue.toLocaleString()}
//                 </p>
//                 <p className="text-xs text-gray-600">Value</p>
//               </div>
//             </div>
//           </div>

//           {/* Add Item Button - Fixed at bottom, always visible */}
//           {selectedCategory && isSuperAdmin && (
//             <div className="flex-shrink-0 p-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
//               <button
//                 onClick={() => {
//                   onAddItem();
//                   setIsMobileOpen(false);
//                 }}
//                 className="btn bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white btn-sm w-full transition-all duration-200 shadow-md hover:shadow-lg border-0"
//               >
//                 <FiPlus size={14} className="mr-2" />
//                 Add Item
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Mobile Overlay */}
//       {isMobileOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
//           onClick={() => setIsMobileOpen(false)}
//         />
//       )}

//       {/* Category Modal */}
//       <CategoryModal
//         isOpen={isCategoryModalOpen}
//         onClose={() => setIsCategoryModalOpen(false)}
//         onCategoryAdded={handleCategoryAdded}
//       />
//     </>
//   );
// };

// export default InventorySidebar;
