import React, { useEffect, useState } from "react";
import ReuseTable from "./ReuseTable";
import { getCustomerData, addCustomer, updateCustomerQuotation } from "./customerData";
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CNav,
  CNavItem,
  CTab,
  CTabContent,
  CTabPane,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow
} from "@coreui/react";
import { jsPDF } from "jspdf";  // Import jsPDF
import "jspdf-autotable";       // Import jspdf-autotable plugin
import * as XLSX from 'xlsx';   // Import xlsx for Excel export

const roomsList = [
  "Living", "Dining", "MBR", "KBR", "CBR", "PBR", "GBR", "Bedroom1",
  "Bedroom2", "Bedroom3", "Bedroom4", "Kitchen", "Utility", "Washroom",
  "Study Room", "Foyer", "Balcony"
];

const Customers = () => {
  const [data, setData] = useState([]);
  const [customer, setCustomer] = useState({ CXName: "", CXLatestQuotation: "", CXStage: "" });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roomQuotations, setRoomQuotations] = useState({});
  const [activeTab, setActiveTab] = useState("");
  const [addedRooms, setAddedRooms] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", length: 0, height: 0, price: 0 });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    setData(getCustomerData());
  }, []);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer.CXName || !customer.CXLatestQuotation || !customer.CXStage) {
      alert("Please fill in all required fields.");
      return;
    }
    addCustomer(customer);
    setData(getCustomerData());
    setCustomer({ CXName: "", CXLatestQuotation: "", CXStage: "" });
  };

  const handleUpdateClick = (index) => {
    const selectedCustomer = data[index];
    setSelectedCustomer({ ...selectedCustomer, index });
    setRoomQuotations({});
    setAddedRooms([]);
    setShowModal(true);

    selectedCustomer.quotations?.forEach((quotation) => {
      setAddedRooms((prevRooms) => [...prevRooms, quotation.room]);
      setRoomQuotations((prev) => ({
        ...prev,
        [quotation.room]: quotation.items
      }));
    });
  };

  const handleAddRoom = (room) => {
    if (room && !addedRooms.includes(room)) {
      setAddedRooms([...addedRooms, room]);
      setRoomQuotations({ ...roomQuotations, [room]: [] });
      setActiveTab(room);
    }
  };

  const handleAddQuotationItem = () => {
    if (!newItem.name || newItem.length <= 0 || newItem.height <= 0 || newItem.price <= 0) {
      alert("Please fill in all fields before adding the item.");
      return;
    }

    if (editingItem !== null) {
      const updatedRoom = [...roomQuotations[activeTab]];
      updatedRoom[editingItem] = { ...newItem };
      setRoomQuotations({ ...roomQuotations, [activeTab]: updatedRoom });
      setEditingItem(null);
    } else {
      const updatedRoom = [...(roomQuotations[activeTab] || []), { ...newItem }];
      setRoomQuotations({ ...roomQuotations, [activeTab]: updatedRoom });
    }

    setNewItem({ name: "", length: 0, height: 0, price: 0 });
  };

  const handleDeleteQuotationItem = (index) => {
    const updatedRoom = roomQuotations[activeTab].filter((item, i) => i !== index);
    setRoomQuotations({ ...roomQuotations, [activeTab]: updatedRoom });
  };

  const handleEditQuotationItem = (index) => {
    const item = roomQuotations[activeTab][index];
    setNewItem(item);
    setEditingItem(index);
  };

  const handleSaveQuotation = () => {
    if (!selectedCustomer) return;

    const updatedCustomer = {
      ...selectedCustomer,
      quotations: Object.entries(roomQuotations).map(([room, items]) => {
        const totalRoomPrice = items.reduce((total, item) => total + (item.length * item.height * item.price), 0);
        return { room, items, totalRoomPrice };
      }),
      totalPrice: Object.values(roomQuotations).reduce((total, items) => total + items.reduce((subTotal, item) => subTotal + (item.length * item.height * item.price), 0), 0)
    };

    updateCustomerQuotation(updatedCustomer.index, updatedCustomer.quotations);
    setData((prevData) => prevData.map((customer, index) =>
      index === updatedCustomer.index ? updatedCustomer : customer
    ));

    setShowModal(false);
  };

  const handleDownloadQuotation = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(16);
    doc.text("Customer Quotation", 14, 16);
  
    let startY = 30;
    addedRooms.forEach((room, index) => {
      const roomItems = roomQuotations[room];
      if (roomItems && roomItems.length > 0) {
        doc.setFontSize(14);
        doc.text(`Room: ${room}`, 14, startY);
        startY += 10;
  
        const tableColumn = ["Item Name","Material", "Length", "Height", "Price", "Total"];
        const tableRows = roomItems.map(item => [
          item.name,
          item.material,
          item.length,
          item.height,
          item.price,
          (item.length * item.height * item.price).toFixed(2)
        ]);
        
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: startY,
          theme: "grid",
          didDrawCell: (data) => {
            // Check if it's the last row of the current table (use data.row.index)
            if (data.row.index === tableRows.length - 1) {
              // Ensure roomItems is properly populated and accessible
              const roomTotal = roomItems.reduce(
                (sum, item) => sum + (item.length * item.height * item.price),
                0
              );
        
              // Draw the room total just below the last row of the table
              doc.text(`Room Total: ₹${roomTotal.toFixed(2)}`, 14, data.cursor.y + 10);
            }
          },
        });
        
  
        if (doc.lastAutoTable) {
          startY = doc.lastAutoTable.finalY + 10; // Move below last table
        } else {
          console.warn("doc.lastAutoTable is undefined, keeping startY unchanged.");
        }
      }
    });
  
    const overallTotal = Object.values(roomQuotations).reduce((total, roomItems) => {
      return total + roomItems.reduce((sum, item) => sum + (item.length * item.height * item.price), 0);
    }, 0);
  
    doc.setFontSize(14);
    doc.text(`Overall Total: ₹${overallTotal.toFixed(2)}`, 14, startY);
  
    doc.save("Customer_Quotation.pdf");
  };

  // Excel Download Handler
  const handleDownloadExcel = () => {
    const wsData = [];

    // Create header row
    wsData.push(["Room", "Item Name","Material", "Length", "Height", "Price", "Total"]);

    addedRooms.forEach((room) => {
      const roomItems = roomQuotations[room];
      if (roomItems && roomItems.length > 0) {
        roomItems.forEach(item => {
          wsData.push([
            room,
            item.name,
            item.material,
            item.length,
            item.height,
            item.price,
            (((item.length * item.height)/90000) * item.price).toFixed(2)
          ]);
        });
      }
    });

    // Generate worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotation");

    // Download the Excel file
    XLSX.writeFile(wb, "Customer_Quotation.xlsx");
  };

  return (
    <div className="container-fluid">
      <CRow>
        <CCol>
          <h2>Customer Management</h2>
          <CForm onSubmit={handleSubmit} className="m-2">
            <CRow>
              <CCol>
                <CFormInput type="text" name="CXName" placeholder="Customer Name" value={customer.CXName} onChange={handleChange} required />
              </CCol>
              <CCol>
                <CFormInput type="text" name="CXLatestQuotation" placeholder="Quotation Value" value={customer.CXLatestQuotation} onChange={handleChange} required />
              </CCol>
              <CCol>
                <CFormInput type="text" name="CXStage" placeholder="Stage" value={customer.CXStage} onChange={handleChange} required />
              </CCol>
              <CCol>
                <CButton color="success" type="submit">Add Customer</CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCol>
      </CRow>

      <h2>Customers</h2>
      <ReuseTable data={data.map((customer, index) => ({
        ...customer,
        CXLatestQuotation: customer.quotations?.slice(-1)[0]?.totalPrice || "N/A ₹",
        CXUpdateQuotationLink: () => handleUpdateClick(index)
      }))} />

      <CModal fullscreen visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Update Quotation</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol>
              <CFormSelect className="m-1" onChange={(e) => handleAddRoom(e.target.value)}>
                <option value="">Select Room to Add</option>
                {roomsList.map((room) => (
                  <option className="m-2" key={room} value={room}>
                    {room}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          <CNav className='m-2' variant="tabs">
            {addedRooms.map((room) => (
              <CNavItem className='m-1' key={room}>
                <CButton
                  color={activeTab === room ? "primary" : "secondary"}
                  onClick={() => setActiveTab(room)}
                >
                  {room}
                </CButton>
              </CNavItem>
            ))}
          </CNav>

          <CTabContent className="">
            {addedRooms.map((room) => (
              <CTabPane key={room} visible={activeTab === room}>
                <div>
                  <CRow className="m-2">
                    <CCol>
                      <CFormInput
                        type="text"
                        placeholder="Item Name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      />
                    </CCol>
                    <CCol>
                      <CFormInput
                        type="text"
                        placeholder="Material"
                        value={newItem.material}
                        onChange={(e) => setNewItem({ ...newItem, material: e.target.value })}
                      />
                    </CCol>
                    <CCol>
                      <CFormInput
                        type="number"
                        placeholder="Length"
                        value={newItem.length}
                        onChange={(e) => setNewItem({ ...newItem, length: parseFloat(e.target.value) })}
                      />
                    </CCol>
                    <CCol>
                      <CFormInput
                        type="number"
                        placeholder="Height"
                        value={newItem.height}
                        onChange={(e) => setNewItem({ ...newItem, height: parseFloat(e.target.value) })}
                      />
                    </CCol>
                    <CCol>
                      <CFormInput
                        type="number"
                        placeholder="Price"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                      />
                    </CCol>
                    <CCol>
                      <CButton color="primary" onClick={handleAddQuotationItem}>
                        {editingItem !== null ? "Edit Item" : "Add Item"}
                      </CButton>
                    </CCol>
                  </CRow>

                  <CTable hover bordered responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Item Name</CTableHeaderCell>
                        <CTableHeaderCell>Material</CTableHeaderCell>
                        <CTableHeaderCell>Length</CTableHeaderCell>
                        <CTableHeaderCell>Height</CTableHeaderCell>
                        <CTableHeaderCell>Price</CTableHeaderCell>
                        <CTableHeaderCell>Total</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {roomQuotations[room]?.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{item.name}</CTableDataCell>
                          <CTableDataCell>{item.material}</CTableDataCell>
                          <CTableDataCell>{item.length}</CTableDataCell>
                          <CTableDataCell>{item.height}</CTableDataCell>
                          <CTableDataCell>{item.price}</CTableDataCell>
                          <CTableDataCell>{(item.length * item.height * item.price).toFixed(2)}</CTableDataCell>
                          <CTableDataCell>
                            <CButton className="m-1" color="warning" onClick={() => handleEditQuotationItem(index)}>Edit</CButton>
                            <CButton color="danger" onClick={() => handleDeleteQuotationItem(index)}>Delete</CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </CTabPane>
            ))}
          </CTabContent>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSaveQuotation}>Save Quotation</CButton>
          {/* <CButton color="success" onClick={handleDownloadQuotation}>Download Quotation (PDF)</CButton> */}
          <CButton color="success" onClick={handleDownloadExcel}>Download Quotation (Excel)</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Customers;  