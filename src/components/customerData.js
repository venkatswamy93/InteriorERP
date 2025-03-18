// Get stored data from localStorage
export const getCustomerData = () => {
    return JSON.parse(localStorage.getItem("customerData")) || [];
  };
  
  // Function to add a new customer and update localStorage
  export const addCustomer = (newCustomer) => {
    const customers = getCustomerData();
    customers.push({ ...newCustomer, quotations: [] });
    localStorage.setItem("customerData", JSON.stringify(customers));
  };
  
  // Function to update customer quotations in localStorage
  export const updateCustomerQuotation = (index, updatedQuotations) => {
    const customers = getCustomerData();
    customers[index].quotations = updatedQuotations;
    localStorage.setItem("customerData", JSON.stringify(customers));
  };
  