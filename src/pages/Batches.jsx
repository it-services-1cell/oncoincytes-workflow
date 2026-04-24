import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const Batches = () => {
  const batches = useStore((state) => state.batches);
  const deleteBatch = useStore((state) => state.deleteBatch);
  const updateTestOrder = useStore((state) => state.updateTestOrder);
  const navigate = useNavigate();

  const handleDeleteBatch = (batchId, sampleIds) => {
    if (window.confirm('Are you sure you want to delete this batch? This will release its samples back to the pool.')) {
      if (sampleIds) {
        sampleIds.forEach(id => {
          updateTestOrder(id, { status: 'Pending' });
        });
      }
      deleteBatch(batchId);
      toast.success('Batch deleted successfully');
    }
  };
  return (
    <div className="page-container">
      <div className="page-header header-with-actions">
        <h1 className="page-title">Batches</h1>
        <button className="btn btn-primary" onClick={() => navigate('/batches/new')}>
          <Plus size={18} />
          Create New Batch
        </button>
      </div>
      
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch Number</th>
                <th>Specimen Type</th>
                <th>Number of Samples</th>
                <th>Date Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <tr key={batch.id}>
                    <td>
                      <Link to={`/batches/${batch.id}`} className="text-primary font-medium" style={{ textDecoration: 'underline' }}>
                        {batch.batchNumber}
                      </Link>
                    </td>
                    <td>{batch.specimenType}</td>
                    <td>{batch.sampleIds ? batch.sampleIds.length : 0}</td>
                    <td>{new Date(batch.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className="status-badge status-processing">
                        {batch.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDeleteBatch(batch.id, batch.sampleIds)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: 'transparent' }}
                        title="Delete Batch"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center placeholder-text" style={{ padding: '3rem' }}>
                    No batches found.
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

export default Batches;
