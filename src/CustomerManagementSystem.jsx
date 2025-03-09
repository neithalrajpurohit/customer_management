import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  History,
  Trash2,
  X,
  Users,
  DollarSign,
  Calendar,
  Phone,
  Package,
} from "lucide-react";

export default function CustomerManagementSystem() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [customerDetails, setCustomerDetails] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    productAmount: "",
    date: "",
    customerName: "",
    contact: "",
    dueAmount: "",
  });
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("productName");
  const [filteredResults, setFilteredResults] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem("customerData");
      if (savedCustomers) {
        const parsedData = JSON.parse(savedCustomers);
        setCustomerDetails(parsedData);
        setFilteredResults(parsedData);
      }

      const savedSortConfig = localStorage.getItem("sortConfig");
      if (savedSortConfig) {
        setSortConfig(JSON.parse(savedSortConfig));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }, []);

  // Save data to localStorage whenever customerDetails changes
  useEffect(() => {
    try {
      if (customerDetails && customerDetails.length > 0) {
        localStorage.setItem("customerData", JSON.stringify(customerDetails));
      }
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [customerDetails]);

  // Save sort configuration to localStorage
  useEffect(() => {
    try {
      if (sortConfig.key) {
        localStorage.setItem("sortConfig", JSON.stringify(sortConfig));
      }
    } catch (error) {
      console.error("Error saving sort config to localStorage:", error);
    }
  }, [sortConfig]);

  // Format number with comma separators
  const formatAmount = (amount) => {
    if (!amount) return "-";
    return `₹${parseFloat(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Handle input changes in the form
  const handleInputChange = (field, event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  // Add new customer
  const handleSubmit = () => {
    if (!formData.customerName || !formData.productName) {
      alert("Customer name and product name are required!");
      return;
    }

    // If date is not provided, use current date
    const submissionDate =
      formData.date || new Date().toISOString().split("T")[0];

    const newCustomer = {
      ...formData,
      date: submissionDate,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };

    const updatedCustomers = [...customerDetails, newCustomer];

    setCustomerDetails(updatedCustomers);
    setFilteredResults(updatedCustomers);
    localStorage.setItem("customerData", JSON.stringify(updatedCustomers));

    setFormData({
      productName: "",
      productAmount: "",
      date: "",
      customerName: "",
      dueAmount: "",
      contact: "",
    });

    setShowAddForm(false);
  };

  // Search functionality
  const handleSearch = () => {
    if (search.trim() === "") {
      setFilteredResults(customerDetails);
      setCurrentPage(1);
      return;
    }

    const results = customerDetails.filter((item) =>
      String(item[searchField] || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredResults(results);
    setCurrentPage(1);
  };

  // Reset search
  const resetSearch = () => {
    setSearch("");
    setFilteredResults(customerDetails);
    setCurrentPage(1);
  };

  // Show history sorted by date
  const showCustomerHistory = () => {
    const sortedByDate = [...customerDetails].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA; // Sort by descending date (newest first)
    });

    setFilteredResults(sortedByDate);
    setShowHistory(true);
    setCurrentPage(1);
  };

  // Reset to normal view (unsorted by date)
  const resetHistoryView = () => {
    setFilteredResults(customerDetails);
    setShowHistory(false);
  };

  // Sorting functionality
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);

    const sortedData = [...filteredResults].sort((a, b) => {
      const valueA = a[key] || "";
      const valueB = b[key] || "";

      if (valueA < valueB) {
        return direction === "ascending" ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredResults(sortedData);
    setCurrentPage(1);
  };

  // Delete all customer data
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to delete all customer data?")) {
      setCustomerDetails([]);
      setFilteredResults([]);
      localStorage.removeItem("customerData");
      localStorage.removeItem("sortConfig");
      alert("All data cleared from localStorage.");
    }
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp size={14} className="inline" />
    ) : (
      <ChevronDown size={14} className="inline" />
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => paginate(1)}
        className={`px-3 py-1 rounded ${
          currentPage === 1 ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
      >
        1
      </button>
    );

    // Calculate range of visible page buttons
    let startPage = Math.max(
      2,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages - 1, startPage + maxVisibleButtons - 3);

    if (startPage > 2) {
      buttons.push(
        <span key="ellipsis1" className="px-2">
          ...
        </span>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages - 1 && totalPages > 1) {
      buttons.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  // Dashboard stats
  const dashboardStats = {
    totalCustomers: new Set(customerDetails.map((c) => c.customerName)).size,
    totalSales: customerDetails.reduce(
      (sum, item) => sum + (parseFloat(item.productAmount) || 0),
      0
    ),
    totalDueAmount: customerDetails.reduce(
      (sum, item) => sum + (parseFloat(item.dueAmount) || 0),
      0
    ),
    totalProducts: customerDetails.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-purple-800 p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white">
            Customer Management System
          </h1>
          <p className="text-blue-100 mt-2">
            Manage your customers and track purchases efficiently
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-xl font-semibold">
                  {dashboardStats.totalCustomers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-xl font-semibold">
                  {formatAmount(dashboardStats.totalSales)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Amounts</p>
                <p className="text-xl font-semibold">
                  {formatAmount(dashboardStats.totalDueAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-xl font-semibold">
                  {dashboardStats.totalProducts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex gap-2">
              <div className="relative flex-grow">
                <div className="flex">
                  <select
                    className="bg-gray-50 border border-r-0 border-gray-300 rounded-l px-3 py-2"
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                  >
                    <option value="productName">Product</option>
                    <option value="customerName">Customer</option>
                    <option value="contact">Phone</option>
                  </select>
                  <input
                    className="flex-grow bg-gray-50 border border-gray-300 px-3 py-2"
                    placeholder={`Search by ${searchField
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()}`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r transition-colors flex items-center"
                    onClick={handleSearch}
                  >
                    <Search size={16} className="mr-1" /> Search
                  </button>
                </div>
                {search && (
                  <button
                    className="absolute right-32 top-2 text-gray-400 hover:text-gray-600"
                    onClick={resetSearch}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className={`${
                  showAddForm
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white px-4 py-2 rounded transition-colors flex items-center`}
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  if (showHistory) resetHistoryView();
                }}
              >
                {showAddForm ? (
                  <X size={16} className="mr-1" />
                ) : (
                  <Plus size={16} className="mr-1" />
                )}
                {showAddForm ? "Cancel" : "Add Customer"}
              </button>
              <button
                className={`${
                  showHistory
                    ? "bg-purple-700 hover:bg-purple-800"
                    : "bg-purple-600 hover:bg-purple-700"
                } text-white px-4 py-2 rounded transition-colors flex items-center`}
                onClick={() => {
                  if (showHistory) {
                    resetHistoryView();
                  } else {
                    showCustomerHistory();
                  }
                }}
              >
                <History size={16} className="mr-1" />
                {showHistory ? "Exit History" : "History"}
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors flex items-center"
                onClick={clearAllData}
              >
                <Trash2 size={16} className="mr-1" /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Add Customer Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Users size={20} className="mr-2" /> Add New Customer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Customer Name*
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => handleInputChange("contact", e)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Purchase Date
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Name*
                </label>
                <input
                  className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange("productName", e)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    ₹
                  </span>
                  <input
                    className="w-full bg-gray-50 border border-gray-300 rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                    value={formData.productAmount}
                    onChange={(e) => handleInputChange("productAmount", e)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Due Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    ₹
                  </span>
                  <input
                    className="w-full bg-gray-50 border border-gray-300 rounded pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="number"
                    value={formData.dueAmount}
                    onChange={(e) => handleInputChange("dueAmount", e)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 mr-2 px-4 py-2 rounded transition-colors"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                onClick={handleSubmit}
              >
                Save Customer
              </button>
            </div>
          </div>
        )}

        {/* Customer Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              {showHistory ? (
                <History size={20} className="mr-2" />
              ) : (
                <Users size={20} className="mr-2" />
              )}
              {showHistory ? "Customer History Records" : "Customer Details"}
              <span className="ml-2 text-sm font-normal text-gray-500">
                {filteredResults.length}{" "}
                {filteredResults.length === 1 ? "record" : "records"} found
              </span>
            </h2>
            {showHistory && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Sorted by date (newest first)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort("customerName")}
                  >
                    <div className="flex items-center">
                      Customer Name {getSortIndicator("customerName")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort("productName")}
                  >
                    <div className="flex items-center">
                      Product Name {getSortIndicator("productName")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort("productAmount")}
                  >
                    <div className="flex items-center">
                      Amount {getSortIndicator("productAmount")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort("date")}
                  >
                    <div className="flex items-center">
                      Date {getSortIndicator("date")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort("dueAmount")}
                  >
                    <div className="flex items-center">
                      Due Amount {getSortIndicator("dueAmount")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => requestSort("contact")}
                  >
                    <div className="flex items-center">
                      Contact {getSortIndicator("contact")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((customer, index) => (
                    <tr key={customer.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.productName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.productAmount
                            ? formatAmount(customer.productAmount)
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.date || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm ${
                            parseFloat(customer.dueAmount) > 0
                              ? "text-red-600 font-medium"
                              : "text-gray-900"
                          }`}
                        >
                          {customer.dueAmount
                            ? formatAmount(customer.dueAmount)
                            : "-"}
                        </div>
                        {parseFloat(customer.dueAmount) > 0 && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2 py-0.5 rounded">
                            Due
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.contact || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      {search
                        ? "No matching records found."
                        : "No customer data available. Add a customer to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredResults.length > itemsPerPage && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredResults.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredResults.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Previous</span>
                      &laquo;
                    </button>

                    <div className="flex space-x-1 px-2">
                      {renderPaginationButtons()}
                    </div>

                    <button
                      onClick={() =>
                        paginate(Math.min(totalPages, currentPage + 1))
                      }
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only">Next</span>
                      &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
