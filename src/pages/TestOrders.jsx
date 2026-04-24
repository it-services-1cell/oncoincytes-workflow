import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import useStore from '../store/useStore';

const TestOrders = () => {
  const navigate = useNavigate();
  const testOrders = useStore((state) => state.testOrders);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter test orders by patient name or order ID
  const filteredOrders = testOrders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order.patientName.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower)
    );
  });

  const getStatusClass = (status) => {
    const s = status.toLowerCase();
    if (s === 'processing' || s === 'in progress') return 'status-processing';
    if (s === 'completed') return 'status-completed';
    return 'status-pending';
  };

  const handleRowClick = (id) => {
    navigate(`/test-orders/${id}`);
  };

  return (
    <div className="page-container">
      <div className="page-header header-with-actions">
        <h1 className="page-title">Test Orders</h1>
        <button className="btn btn-primary" onClick={() => navigate('/test-orders/new')}>
          <Plus size={18} />
          New Order
        </button>
      </div>
      
      <div className="card">
        <div className="table-toolbar">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by patient name or order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="data-table clickable-rows">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient Name</th>
                <th>Patient ID</th>
                <th>Requesting Physician</th>
                <th>Hospital</th>
                <th>Specimen</th>
                <th>Test Name</th>
                <th>Collection Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} onClick={() => handleRowClick(order.id)}>
                    <td className="font-medium text-primary">{order.id}</td>
                    <td className="font-medium">{order.patientName}</td>
                    <td className="text-secondary">{order.patientID}</td>
                    <td>{order.physicianName}</td>
                    <td>{order.hospitalName}</td>
                    <td>{order.specimenType}</td>
                    <td>{order.testName}</td>
                    <td>{new Date(order.collectionDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center placeholder-text" style={{ padding: '3rem' }}>
                    No test orders found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestOrders;
