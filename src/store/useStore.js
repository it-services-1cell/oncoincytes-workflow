import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate some mock IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const MOCK_TEST_ORDERS = [
  {
    id: 'ord_1a2b3c',
    patientName: 'John Doe',
    patientDOB: '1975-04-12',
    patientID: 'PID-883921',
    physicianName: 'Dr. Emily Chen',
    hospitalName: 'General Memorial Hospital',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-20T08:30:00Z',
    status: 'Pending',
    createdAt: '2026-04-20T09:15:00Z'
  },
  {
    id: 'ord_4d5e6f',
    patientName: 'Jane Smith',
    patientDOB: '1982-11-05',
    patientID: 'PID-112349',
    physicianName: 'Dr. Michael Rodriguez',
    hospitalName: 'City Cancer Center',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-21T10:00:00Z',
    status: 'Processing',
    createdAt: '2026-04-21T11:45:00Z'
  },
  {
    id: 'ord_7g8h9i',
    patientName: 'Alice Johnson',
    patientDOB: '1968-02-28',
    patientID: 'PID-445902',
    physicianName: 'Dr. Sarah Lee',
    hospitalName: 'University Hospital',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-22T14:20:00Z',
    status: 'Pending',
    createdAt: '2026-04-22T16:00:00Z'
  },
  {
    id: 'ord_0j1k2l',
    patientName: 'Robert Williams',
    patientDOB: '1955-09-15',
    patientID: 'PID-776210',
    physicianName: 'Dr. David Kim',
    hospitalName: 'Regional Medical Center',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-23T09:45:00Z',
    status: 'Completed',
    createdAt: '2026-04-23T10:30:00Z'
  },
  {
    id: 'ord_1b3c5d',
    patientName: 'Samuel Green',
    patientDOB: '1980-05-12',
    patientID: 'PID-234567',
    physicianName: 'Dr. Emily Chen',
    hospitalName: 'General Memorial Hospital',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-23T10:00:00Z',
    status: 'Pending',
    createdAt: '2026-04-23T10:15:00Z'
  },
  {
    id: 'ord_2x9y8z',
    patientName: 'Linda Martinez',
    patientDOB: '1965-08-20',
    patientID: 'PID-345678',
    physicianName: 'Dr. Michael Rodriguez',
    hospitalName: 'City Cancer Center',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-24T09:30:00Z',
    status: 'Pending',
    createdAt: '2026-04-24T09:45:00Z'
  },
  {
    id: 'ord_3q4w5e',
    patientName: 'James Wilson',
    patientDOB: '1972-11-03',
    patientID: 'PID-456789',
    physicianName: 'Dr. Sarah Lee',
    hospitalName: 'University Hospital',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-24T11:00:00Z',
    status: 'Pending',
    createdAt: '2026-04-24T11:30:00Z'
  },
  {
    id: 'ord_4r5t6y',
    patientName: 'Patricia Taylor',
    patientDOB: '1958-01-15',
    patientID: 'PID-567890',
    physicianName: 'Dr. David Kim',
    hospitalName: 'Regional Medical Center',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-24T13:20:00Z',
    status: 'Pending',
    createdAt: '2026-04-24T14:00:00Z'
  },
  {
    id: 'ord_5a6s7d',
    patientName: 'William Anderson',
    patientDOB: '1985-06-30',
    patientID: 'PID-678901',
    physicianName: 'Dr. Emily Chen',
    hospitalName: 'General Memorial Hospital',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-24T14:45:00Z',
    status: 'Pending',
    createdAt: '2026-04-24T15:00:00Z'
  },
  {
    id: 'ord_6z7x8c',
    patientName: 'Mary Thomas',
    patientDOB: '1960-12-05',
    patientID: 'PID-789012',
    physicianName: 'Dr. Sarah Lee',
    hospitalName: 'University Hospital',
    testName: 'OncoInsight',
    specimenType: 'CTC',
    collectionDate: '2026-04-24T15:30:00Z',
    status: 'Pending',
    createdAt: '2026-04-24T16:00:00Z'
  }
];

const useStore = create(
  persist(
    (set) => ({
      // State
  testOrders: MOCK_TEST_ORDERS,
  batches: [],
  samples: [],
  aliquots: [],

  // Actions for TestOrders
  addTestOrder: (order) => set((state) => ({
    testOrders: [...state.testOrders, { ...order, id: generateId(), testName: 'OncoInsight', createdAt: new Date().toISOString() }]
  })),
  
  updateTestOrder: (id, updates) => set((state) => ({
    testOrders: state.testOrders.map(order => 
      order.id === id ? { ...order, ...updates } : order
    )
  })),

  // Actions for Batches
  addBatch: (batch) => set((state) => ({
    batches: [...state.batches, { ...batch, id: generateId(), createdAt: new Date().toISOString() }]
  })),

  updateBatch: (id, updates) => set((state) => ({
    batches: state.batches.map(batch => 
      batch.id === id ? { ...batch, ...updates } : batch
    )
  })),

  deleteBatch: (id) => set((state) => ({
    batches: state.batches.filter(batch => batch.id !== id)
  })),

  // Actions for Samples
  addSample: (sample) => set((state) => {
    const newSample = { ...sample, id: sample.id || generateId() };
    return {
      samples: [...state.samples.filter(s => s.id !== newSample.id), newSample]
    };
  }),

  updateSample: (id, updates) => set((state) => ({
    samples: state.samples.map(sample => 
      sample.id === id ? { ...sample, ...updates } : sample
    )
  })),

  // Actions for Aliquots
  addAliquot: (aliquot) => set((state) => {
    const newAliquot = { ...aliquot, id: aliquot.id || generateId() };
    return {
      aliquots: [...state.aliquots, newAliquot]
    };
  }),

  clearAliquotsBySampleId: (sampleId) => set((state) => ({
    aliquots: state.aliquots.filter(a => a.sampleId !== sampleId)
  })),

  updateAliquot: (id, updates) => set((state) => ({
    aliquots: state.aliquots.map(aliquot => 
      aliquot.id === id ? { ...aliquot, ...updates } : aliquot
    )
  }))
    }),
    {
      name: 'oncoinsight-storage', // unique name
    }
  )
);

export default useStore;
