import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const BatchDetail = () => {
  const { id } = useParams(); // Could be batch ID or batchNumber
  const navigate = useNavigate();
  
  const batches = useStore((state) => state.batches);
  const testOrders = useStore((state) => state.testOrders);
  const storedSamples = useStore((state) => state.samples);
  const storedAliquots = useStore((state) => state.aliquots);
  const addSample = useStore((state) => state.addSample);
  const addAliquot = useStore((state) => state.addAliquot);
  const clearAliquotsBySampleId = useStore((state) => state.clearAliquotsBySampleId);
  const updateBatch = useStore((state) => state.updateBatch);
  const updateTestOrder = useStore((state) => state.updateTestOrder);

  // Find the batch (try both ID and batchNumber)
  const batch = useMemo(() => 
    batches.find(b => b.id === id || b.batchNumber === id), 
  [batches, id]);

  const batchOrders = useMemo(() => {
    if (!batch || !batch.sampleIds) return [];
    return testOrders.filter(o => batch.sampleIds.includes(o.id));
  }, [batch, testOrders]);

  // Aliquot Plan State: { [orderId]: { count: N, aliquots: [{ index: 0, dest: '', loc: '', temp: '' }, ...] } }
  const [aliquotPlan, setAliquotPlan] = useState({});
  const [expandedRows, setExpandedRows] = useState({}); // { [orderId]: boolean }

  // Initialize plan
  useEffect(() => {
    if (batchOrders.length > 0 && Object.keys(aliquotPlan).length === 0) {
      const initialPlan = {};
      const initialExpanded = {};
      batchOrders.forEach(order => {
        const sampleId = `S-${order.id.replace('ord_', '')}`;
        const existingSample = storedSamples.find(s => s.id === sampleId && s.batchId === batch.id);

        if (existingSample) {
          const existingAliquots = storedAliquots
            .filter(a => a.sampleId === sampleId)
            .sort((a, b) => a.index - b.index)
            .map(a => ({
              index: a.index,
              destination: a.destination || '',
              storageLocation: a.storageLocation || '',
              storageTemperature: a.storageTemperature || ''
            }));
            
          initialPlan[order.id] = {
            count: existingSample.duplicateCount,
            aliquots: existingAliquots
          };
        } else {
          initialPlan[order.id] = {
            count: '',
            aliquots: []
          };
        }
        initialExpanded[order.id] = true; // start expanded so user sees them
      });
      setAliquotPlan(initialPlan);
      setExpandedRows(initialExpanded);
    }
  }, [batchOrders, storedSamples, storedAliquots, batch.id]);

  if (!batch) {
    return (
      <div className="page-container">
        <div className="card text-center" style={{ padding: '3rem' }}>
          <h3>Batch not found</h3>
          <Link to="/batches" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex', textDecoration: 'none' }}>
            Back to Batches
          </Link>
        </div>
      </div>
    );
  }

  const handleCountChange = (orderId, newCountStr) => {
    let newCount = newCountStr === '' ? '' : parseInt(newCountStr, 10);
    if (newCount !== '' && (isNaN(newCount) || newCount < 1)) newCount = 1;
    
    setAliquotPlan(prev => {
      const current = prev[orderId];
      // Total rows = N + 1 (original + duplicates)
      const totalRows = newCount === '' ? 0 : newCount + 1;
      
      let newAliquots = [...current.aliquots];
      if (totalRows > newAliquots.length) {
        // Add more
        for (let i = newAliquots.length; i < totalRows; i++) {
          newAliquots.push({ index: i, destination: '', storageLocation: '', storageTemperature: '' });
        }
      } else if (totalRows < newAliquots.length) {
        // Remove excess
        newAliquots = newAliquots.slice(0, totalRows);
      }
      
      return {
        ...prev,
        [orderId]: { count: newCount, aliquots: newAliquots }
      };
    });
  };

  const handleAliquotChange = (orderId, index, field, value) => {
    setAliquotPlan(prev => {
      const newAliquots = [...prev[orderId].aliquots];
      newAliquots[index] = { ...newAliquots[index], [field]: value };
      return {
        ...prev,
        [orderId]: { ...prev[orderId], aliquots: newAliquots }
      };
    });
  };

  const toggleRow = (orderId) => {
    setExpandedRows(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const generateSampleId = (orderId) => {
    return `S-${orderId.replace('ord_', '')}`;
  };

  const handleSavePlan = () => {
    // Basic validation: ensure all destinations are selected
    let isValid = true;
    for (const orderId of Object.keys(aliquotPlan)) {
      const plan = aliquotPlan[orderId];
      if (plan.count === '' || plan.count < 1) {
        isValid = false;
      }
      for (const aliquot of plan.aliquots) {
        if (!aliquot.destination) {
          isValid = false;
        }
        if (aliquot.destination === 'Storage' && (!aliquot.storageLocation || !aliquot.storageTemperature)) {
          isValid = false;
        }
      }
    }

    if (!isValid) {
      toast.error("Please fill out all required destination and storage fields before saving.");
      return;
    }

    // Save to store
    batchOrders.forEach(order => {
      const plan = aliquotPlan[order.id];
      const sampleId = generateSampleId(order.id);
      
      // Add sample
      addSample({
        id: sampleId, // Provide fixed ID for cross-reference
        orderId: order.id,
        batchId: batch.id,
        specimenType: order.specimenType,
        duplicateCount: plan.count
      });

      // Clear old aliquots for this sample to avoid duplicates
      clearAliquotsBySampleId(sampleId);

      // Add aliquots
      plan.aliquots.forEach((aliquot, i) => {
        addAliquot({
          sampleId: sampleId,
          index: i,
          destination: aliquot.destination,
          storageLocation: aliquot.storageLocation,
          storageTemperature: aliquot.storageTemperature
        });
      });
      
      // Update order status to Processing
      updateTestOrder(order.id, { status: 'Processing' });
    });

    // Update batch status to indicate aliquots are planned / Isolation Complete
    updateBatch(batch.id, { status: 'Isolation Complete' });
    
    toast.success('Aliquot plan saved successfully');
    navigate('/batches');
  };

  return (
    <div className="page-container">
      <div className="page-header header-with-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/batches" className="back-link">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="page-title">Batch Details: {batch.batchNumber}</h1>
        </div>
        <span className="status-badge status-processing" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          {batch.status}
        </span>
      </div>

      {/* Batch Header Info */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="form-grid">
          <div>
            <div className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Date Created</div>
            <div className="font-medium">{new Date(batch.createdAt).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Specimen Type</div>
            <div className="font-medium">{batch.specimenType}</div>
          </div>
          <div>
            <div className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Number of Samples</div>
            <div className="font-medium">{batchOrders.length} base orders</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="form-section-title" style={{ marginBottom: '1.5rem' }}>CTC Isolation & Aliquoting</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Sample ID</th>
                <th>Patient Name</th>
                <th>Order ID</th>
                <th>Collection Date</th>
                <th>Number of Aliquots</th>
              </tr>
            </thead>
            <tbody>
              {batchOrders.length > 0 ? (
                batchOrders.map((order) => {
                  const isExpanded = expandedRows[order.id];
                  const plan = aliquotPlan[order.id] || { count: 1, aliquots: [] };
                  const sampleId = generateSampleId(order.id);
                  
                  return (
                    <React.Fragment key={order.id}>
                      <tr className={isExpanded ? 'active-row' : ''}>
                        <td>
                          <button 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
                            onClick={() => toggleRow(order.id)}
                          >
                            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                        </td>
                        <td className="font-medium text-primary">{sampleId}</td>
                        <td className="font-medium">{order.patientName}</td>
                        <td className="text-secondary">{order.id}</td>
                        <td>{new Date(order.collectionDate).toLocaleDateString()}</td>
                        <td>
                          <input 
                            type="number" 
                            min="1" 
                            className="form-input" 
                            style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                            value={plan.count}
                            onChange={(e) => handleCountChange(order.id, e.target.value)}
                          />
                        </td>
                      </tr>
                      
                      {/* Expanded Sub-rows for Aliquots */}
                      {isExpanded && plan.aliquots.map((aliquot, idx) => (
                        <tr key={`${order.id}-aliquot-${idx}`} style={{ backgroundColor: 'var(--slate-50)' }}>
                          <td></td>
                          <td colSpan="5">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.5rem 0' }}>
                              <div style={{ width: '120px', fontWeight: '500', color: 'var(--slate-700)' }}>
                                {idx === 0 ? `${sampleId} (Original)` : `${sampleId}-${idx}`}
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>Destination:</label>
                                <select 
                                  className="form-select" 
                                  style={{ padding: '0.25rem 0.5rem', minWidth: '180px' }}
                                  value={aliquot.destination}
                                  onChange={(e) => handleAliquotChange(order.id, idx, 'destination', e.target.value)}
                                >
                                  <option value="" disabled>Select...</option>
                                  <option value="Storage">Storage</option>
                                  <option value="Genomics">Genomics</option>
                                  <option value="Transomics">Transomics</option>
                                  <option value="Immunofluorescence">Immunofluorescence</option>
                                  <option value="qPCR">qPCR</option>
                                </select>
                              </div>
                              
                              {aliquot.destination === 'Storage' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Storage Location" 
                                    style={{ padding: '0.25rem 0.5rem' }}
                                    value={aliquot.storageLocation || ''}
                                    onChange={(e) => handleAliquotChange(order.id, idx, 'storageLocation', e.target.value)}
                                  />
                                  <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Temp (e.g. -80°C)" 
                                    style={{ padding: '0.25rem 0.5rem', width: '140px' }}
                                    value={aliquot.storageTemperature || ''}
                                    onChange={(e) => handleAliquotChange(order.id, idx, 'storageTemperature', e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center placeholder-text" style={{ padding: '2rem' }}>
                    No samples found for this batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="form-actions" style={{ marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={handleSavePlan}>
            <Save size={18} />
            Save Aliquot Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;
