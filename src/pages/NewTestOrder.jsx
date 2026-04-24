import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';

const NewTestOrder = () => {
  const navigate = useNavigate();
  const addTestOrder = useStore((state) => state.addTestOrder);

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    patientDOB: '',
    patientID: '',
    physicianName: '',
    hospitalName: '',
    specimenType: '',
    collectionDate: '',
  });

  // Validation State
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient Name is required';
    if (!formData.patientDOB) newErrors.patientDOB = 'Date of Birth is required';
    if (!formData.patientID.trim()) newErrors.patientID = 'Patient ID is required';
    if (!formData.physicianName.trim()) newErrors.physicianName = 'Physician Name is required';
    if (!formData.hospitalName.trim()) newErrors.hospitalName = 'Hospital Name is required';
    if (!formData.specimenType) newErrors.specimenType = 'Specimen Type is required';
    if (!formData.collectionDate) newErrors.collectionDate = 'Collection Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      addTestOrder({
        ...formData,
        status: 'Pending',
        // testName and id, createdAt are handled by the store
      });
      toast.success('Test order created successfully');
      navigate('/test-orders');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header header-with-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/test-orders" className="back-link">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="page-title">New Test Order</h1>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="form-container">
          {/* Patient Section */}
          <div className="form-section">
            <h3 className="form-section-title">Patient Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="patientName">Full Name</label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  className={`form-input ${errors.patientName ? 'input-error' : ''}`}
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                />
                {errors.patientName && <span className="error-text">{errors.patientName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="patientDOB">Date of Birth</label>
                <input
                  type="date"
                  id="patientDOB"
                  name="patientDOB"
                  className={`form-input ${errors.patientDOB ? 'input-error' : ''}`}
                  value={formData.patientDOB}
                  onChange={handleChange}
                />
                {errors.patientDOB && <span className="error-text">{errors.patientDOB}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="patientID">Patient ID</label>
                <input
                  type="text"
                  id="patientID"
                  name="patientID"
                  className={`form-input ${errors.patientID ? 'input-error' : ''}`}
                  value={formData.patientID}
                  onChange={handleChange}
                  placeholder="e.g. PID-12345"
                />
                {errors.patientID && <span className="error-text">{errors.patientID}</span>}
              </div>
            </div>
          </div>

          <hr className="form-divider" />

          {/* Requesting Physician Section */}
          <div className="form-section">
            <h3 className="form-section-title">Requesting Physician</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="physicianName">Physician Full Name</label>
                <input
                  type="text"
                  id="physicianName"
                  name="physicianName"
                  list="physician-list"
                  className={`form-input ${errors.physicianName ? 'input-error' : ''}`}
                  value={formData.physicianName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Emily Chen"
                />
                <datalist id="physician-list">
                  <option value="Dr. Emily Chen" />
                  <option value="Dr. Michael Rodriguez" />
                  <option value="Dr. Sarah Lee" />
                  <option value="Dr. David Kim" />
                </datalist>
                {errors.physicianName && <span className="error-text">{errors.physicianName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="hospitalName">Hospital / Institution</label>
                <input
                  type="text"
                  id="hospitalName"
                  name="hospitalName"
                  list="hospital-list"
                  className={`form-input ${errors.hospitalName ? 'input-error' : ''}`}
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="e.g. General Memorial Hospital"
                />
                <datalist id="hospital-list">
                  <option value="General Memorial Hospital" />
                  <option value="City Cancer Center" />
                  <option value="University Hospital" />
                  <option value="Regional Medical Center" />
                </datalist>
                {errors.hospitalName && <span className="error-text">{errors.hospitalName}</span>}
              </div>
            </div>
          </div>

          <hr className="form-divider" />

          {/* Test Section */}
          <div className="form-section">
            <h3 className="form-section-title">Test Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Test Name</label>
                <div className="form-read-only">OncoInsight</div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="specimenType">Specimen Type</label>
                <select
                  id="specimenType"
                  name="specimenType"
                  className={`form-select ${errors.specimenType ? 'input-error' : ''}`}
                  value={formData.specimenType}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select a specimen type</option>
                  <option value="cfDNA">cfDNA (cell-free DNA)</option>
                  <option value="ctDNA">ctDNA (circulating tumour cell DNA)</option>
                  <option value="CTC">CTC (circulating tumour cell)</option>
                </select>
                {errors.specimenType && <span className="error-text">{errors.specimenType}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="collectionDate">Collection Date</label>
                <input
                  type="date"
                  id="collectionDate"
                  name="collectionDate"
                  className={`form-input ${errors.collectionDate ? 'input-error' : ''}`}
                  value={formData.collectionDate}
                  onChange={handleChange}
                />
                {errors.collectionDate && <span className="error-text">{errors.collectionDate}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/test-orders" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary">
              <Save size={18} />
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTestOrder;
