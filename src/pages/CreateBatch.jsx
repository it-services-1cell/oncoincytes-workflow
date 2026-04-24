import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const CreateBatch = () => {
  const navigate = useNavigate();
  const batches = useStore((state) => state.batches);
  const testOrders = useStore((state) => state.testOrders);
  const addBatch = useStore((state) => state.addBatch);
  const updateTestOrder = useStore((state) => state.updateTestOrder);
  
  const [formData, setFormData] = useState({
    fromDept: 'Accessioning',
    toDept: 'CTC',
    transport: 'In Lab',
    temperature: 'In Range',
    priority: 'Regular',
    duration: '5 Weeks (35 Days)',
    notes: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Find CTC orders that are not in any batch yet
  const availableOrders = testOrders.filter(order => {
    if (order.specimenType !== 'CTC') return false;
    if (batches.some(b => b.sampleIds && b.sampleIds.includes(order.id))) return false;
    
    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return order.id.toLowerCase().includes(q) || order.patientName.toLowerCase().includes(q);
    }
    return true;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(availableOrders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSave = () => {
    if (selectedOrders.length === 0) return;

    if (selectedOrders.length < 2) {
      if (!window.confirm("Warning: Creating a batch with fewer than 2 samples is unusual. Are you sure you want to proceed?")) {
        return;
      }
    }

    // Generate BATCH-YYYYMMDD-XXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
    const batchNumber = `BATCH-${dateStr}-${randomNum}`;

    // Add batch
    addBatch({
      batchNumber,
      specimenType: 'CTC',
      status: 'Active',
      sampleIds: selectedOrders,
      ...formData
    });

    // Update test orders status
    selectedOrders.forEach(id => {
      updateTestOrder(id, { status: 'In Progress' });
    });

    toast.success('Batch created successfully');
    navigate('/batches');
  };

  return (
    <div className="batch-creation-container">
      {/* LEFT COLUMN: Handover Summary */}
      <div className="bc-column bc-left">
        <div className="bc-card">
          <div className="bc-card-header">
            <h3>Handover Summary</h3>
          </div>
          <div className="bc-card-body">
            <div className="bc-form-group">
              <label>From Department <span className="text-danger">*</span></label>
              <select name="fromDept" value={formData.fromDept} onChange={handleChange} className="bc-select">
                <option value="Accessioning">Accessioning</option>
                <option value="Storage">Storage</option>
              </select>
            </div>

            <div className="bc-form-group">
              <label>To Department <span className="text-danger">*</span></label>
              <select name="toDept" value={formData.toDept} onChange={handleChange} className="bc-select">
                <option value="CTC">CTC</option>
                <option value="Genomics">Genomics</option>
              </select>
            </div>

            <div className="bc-form-group">
              <label>Transport <span className="text-danger">*</span></label>
              <select name="transport" value={formData.transport} onChange={handleChange} className="bc-select">
                <option value="In Lab">In Lab</option>
                <option value="Courier">Courier</option>
              </select>
            </div>

            <div className="bc-form-group">
              <label>Temperature <span className="text-danger">*</span></label>
              <select name="temperature" value={formData.temperature} onChange={handleChange} className="bc-select">
                <option value="In Range">In Range</option>
                <option value="Out of Range">Out of Range</option>
              </select>
            </div>

            <div className="bc-form-group">
              <label>Priority <span className="text-danger">*</span></label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="bc-select">
                <option value="Regular">Regular</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT">STAT</option>
              </select>
            </div>

            <div className="bc-form-group">
              <label>Duration <span className="text-danger">*</span></label>
              <select name="duration" value={formData.duration} onChange={handleChange} className="bc-select">
                <option value="5 Weeks (35 Days)">5 Weeks (35 Days)</option>
                <option value="1 Week (7 Days)">1 Week (7 Days)</option>
              </select>
            </div>

            <button className="bc-btn-primary bc-search-btn" onClick={() => setHasSearched(true)}>
              <Search size={16} /> Search Samples
            </button>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Select Samples */}
      <div className="bc-column bc-center">
        <div className="bc-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="bc-card-header">
            <h3>Select Samples for Batch</h3>
          </div>
          <div className="bc-card-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="bc-search-bar">
              <div className="bc-search-input-wrapper">
                <Search size={16} className="bc-search-icon" />
                <input 
                  type="text" 
                  placeholder="Sample Barcode or Patient Name..." 
                  className="bc-input-search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bc-btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setHasSearched(true)}>Search</button>
              <button 
                className="bc-btn-default" 
                style={{ padding: '0.5rem 1rem' }} 
                onClick={() => {
                  setSearchQuery('');
                  setHasSearched(false);
                  setSelectedOrders([]);
                }}
              >
                Clear
              </button>
            </div>

            {hasSearched ? (
              availableOrders.length > 0 ? (
                <div className="table-container" style={{ flexGrow: 1, overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAll}
                            checked={selectedOrders.length === availableOrders.length && availableOrders.length > 0}
                          />
                        </th>
                        <th>Order ID</th>
                        <th>Patient Name</th>
                        <th>Collection Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableOrders.map(order => (
                        <tr key={order.id}>
                          <td>
                            <input 
                              type="checkbox" 
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => handleToggleOrder(order.id)}
                            />
                          </td>
                          <td className="font-medium text-primary">{order.id}</td>
                          <td>{order.patientName}</td>
                          <td>{new Date(order.collectionDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bc-empty-state">
                  No samples available matching your search.
                </div>
              )
            ) : (
              <div className="bc-empty-state">
                No samples available. Please search for samples.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Batch Preview */}
      <div className="bc-column bc-right">
        <div className="bc-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div className="bc-card-header">
            <h3>Batch Preview</h3>
          </div>
          <div className="bc-card-body" style={{ flexGrow: 1, paddingBottom: '5rem' }}>
            
            <div className="bc-transfer-details">
              <h4 className="bc-transfer-title">TRANSFER DETAILS</h4>
              
              <div className="bc-transfer-route">
                <div className="bc-route-point">
                  <div className="bc-route-label">From</div>
                  <div className="bc-route-value">{formData.fromDept}</div>
                </div>
                <div className="bc-route-arrow">
                  <ArrowRight size={20} color="#3b82f6" />
                </div>
                <div className="bc-route-point">
                  <div className="bc-route-label">To</div>
                  <div className="bc-route-value">{formData.toDept}</div>
                </div>
              </div>

              <div className="bc-transfer-row">
                <span className="bc-row-label">Transport:</span>
                <span className="bc-row-value">{formData.transport}</span>
              </div>
              <div className="bc-transfer-row">
                <span className="bc-row-label">Priority:</span>
                <span className={`bc-priority-badge bc-priority-${formData.priority.toLowerCase()}`}>
                  {formData.priority}
                </span>
              </div>
              <div className="bc-transfer-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <span className="bc-row-label">Created By:</span>
                <span className="bc-row-value">admin@indx.ai</span>
              </div>
            </div>

            <div className="bc-notes-section">
              <label>Notes (Optional)</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any notes about this batch..."
                className="bc-textarea"
                rows={4}
              />
            </div>
          </div>
          
          <div className="bc-card-footer">
            <button className="bc-btn-cancel" onClick={() => navigate('/batches')}>Cancel</button>
            <button 
              className={`bc-btn-primary ${selectedOrders.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={selectedOrders.length === 0}
              onClick={handleSave}
              style={{ width: 'auto' }}
            >
              Save Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBatch;
