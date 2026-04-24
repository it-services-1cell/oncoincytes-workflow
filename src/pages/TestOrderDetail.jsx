import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TestOrderDetail = () => {
  const { id } = useParams();

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/test-orders" className="back-link">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title">Order Details: {id}</h1>
      </div>
      <div className="card">
        <p className="placeholder-text">Full order details, patient information, and timeline will go here.</p>
      </div>
    </div>
  );
};

export default TestOrderDetail;
