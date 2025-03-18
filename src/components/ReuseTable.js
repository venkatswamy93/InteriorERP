import React, { useState } from "react";
import { CTable, CTableHead, CTableHeaderCell, CTableRow, CTableBody, CTableDataCell, CButton } from "@coreui/react";

const ReuseTable = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <CTable hover bordered>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.NO</CTableHeaderCell>
            <CTableHeaderCell>Customer Name</CTableHeaderCell>
            <CTableHeaderCell>Quotation Value</CTableHeaderCell>
            <CTableHeaderCell>Stage</CTableHeaderCell>
            <CTableHeaderCell>Update Quotation</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentItems.map((item, index) => (
            <CTableRow key={index}>
              <CTableHeaderCell>{indexOfFirstItem + index + 1}</CTableHeaderCell>
              <CTableDataCell>{item.CXName}</CTableDataCell>
              <CTableDataCell>{item.CXLatestQuotation}</CTableDataCell>
              <CTableDataCell>{item.CXStage}</CTableDataCell>
              <CTableDataCell>
                <CButton color="primary" onClick={item.CXUpdateQuotationLink}>
                  Update
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Pagination */}
      <div className="pagination m-1">
        {Array.from({ length: totalPages }, (_, index) => (
          <CButton
            className="m-1"
            key={index}
            color={index + 1 === currentPage ? "primary" : "secondary"}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </CButton>
        ))}
      </div>
    </div>
  );
};

export default ReuseTable;
