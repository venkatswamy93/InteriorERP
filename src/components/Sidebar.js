import React from 'react'
import {
  CBadge,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
  CNavGroup,
  CNavItem,
  CNavTitle,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilLayers, cilPuzzle, cilSpeedometer } from '@coreui/icons'

const Sidebar = () => {
  return (
    <CSidebar unfoldable colorScheme="dark" className="custom-sidebar">
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand className='style'> Demo </CSidebarBrand>
      </CSidebarHeader>
      <CSidebarNav>
        <CNavTitle>Navigation</CNavTitle>
        <CNavItem href="/dashboard">
          <CIcon customClassName="nav-icon" icon={cilSpeedometer} /> Dashboard
        </CNavItem>
        <CNavGroup
          toggler={
            <>
              <CIcon customClassName="nav-icon" icon={cilPuzzle} /> Customers
            </>
          }
        >
          <CNavItem href="/home"> Under Working </CNavItem>
          <CNavItem href="/customers"> Quotation </CNavItem>
        </CNavGroup>
        
      </CSidebarNav>
    </CSidebar>
  )
}

export default Sidebar
