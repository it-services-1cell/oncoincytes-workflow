import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown, ChevronRight, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DESTINATIONS = ['CTC Bank', 'ImmunoFlorosence', 'Gemonics', 'Transcriptomics', 'Genomics+Transcriptomics', 'Transcriptomics +', 'Triomics', 'qPCR'];
const CTC_TYPES = ['Singlet', 'Doublet', 'Cluster'];

const statusVariant = (status) => {
  if (status === 'Isolation Complete') return 'success';
  if (status === 'Active') return 'info';
  return 'secondary';
};

const BatchDetail = () => {
  const { id } = useParams();
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

  const batch = useMemo(() => batches.find(b => b.id === id || b.batchNumber === id), [batches, id]);
  const batchOrders = useMemo(() => {
    if (!batch || !batch.sampleIds) return [];
    return testOrders.filter(o => batch.sampleIds.includes(o.id));
  }, [batch, testOrders]);

  const [aliquotPlan, setAliquotPlan] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [activeAssignedTo, setActiveAssignedTo] = useState(batch?.assignedTo || '');
  const [acceptedOnChecked, setAcceptedOnChecked] = useState(!!batch?.acceptedOn);
  const [acceptedOnDate, setAcceptedOnDate] = useState(batch?.acceptedOn ? batch.acceptedOn.slice(0, 10) : '');
  const [verificationStates, setVerificationStates] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (batchOrders.length > 0 && Object.keys(aliquotPlan).length === 0) {
      const initialPlan = {};
      const initialExpanded = {};
      batchOrders.forEach(order => {
        const sampleId = `S-${order.id.replace('ord_', '')}`;
        const existing = storedSamples.find(s => s.id === sampleId && s.batchId === batch.id);
        if (existing) {
          const existingAliquots = storedAliquots
            .filter(a => a.sampleId === sampleId)
            .sort((a, b) => a.index - b.index)
            .map(a => ({ 
              index: a.index, 
              destination: a.destination || '', 
              ctcType: a.ctcType || '', 
              storageTemperature: a.storageTemperature || '',
              storageBox: a.storageBox || a.storageLocation || '', 
              boxPosition: a.boxPosition || '',
              freezer: a.freezer || '',
              rack: a.rack || '',
              location: a.location || ''
            }));
          initialPlan[order.id] = { 
            count: existing.duplicateCount, 
            aliquots: existingAliquots,
            bloodVol: existing.bloodVol || ''
          };
        } else {
          initialPlan[order.id] = { count: '', aliquots: [], bloodVol: '' };
        }
        initialExpanded[order.id] = true;
      });
      setAliquotPlan(initialPlan);
      setExpandedRows(initialExpanded);
    }
  }, [batchOrders, storedSamples, storedAliquots, batch?.id]);

  useEffect(() => {
    if (batchOrders.length > 0) {
      setVerificationStates((prev) => {
        const next = { ...prev };
        batchOrders.forEach((order) => {
          if (next[order.id] === undefined) {
            next[order.id] = false;
          }
        });
        return next;
      });
      setActiveAssignedTo(batch?.assignedTo || '');
      setAcceptedOnChecked(!!batch?.acceptedOn);
      setAcceptedOnDate(batch?.acceptedOn ? batch.acceptedOn.slice(0, 10) : '');
    }
  }, [batchOrders, batch?.assignedTo, batch?.acceptedOn]);

  if (!batch) {
    return (
      <div className="p-6">
        <Card className="text-center p-12">
          <p className="text-muted-foreground mb-4">Batch not found</p>
          <Button asChild><Link to="/batches">Back to Batches</Link></Button>
        </Card>
      </div>
    );
  }

  const handleCountChange = (orderId, val) => {
    setErrors(prev => ({ ...prev, [`count-${orderId}`]: false }));
    let newCount = val === '' ? '' : parseInt(val, 10);
    if (newCount !== '' && (isNaN(newCount) || newCount < 1)) newCount = 1;
    setAliquotPlan(prev => {
      const current = prev[orderId];
      const totalRows = newCount === '' ? 0 : newCount + 1;
      let newAliquots = [...current.aliquots];
      if (totalRows > newAliquots.length) {
        for (let i = newAliquots.length; i < totalRows; i++)
          newAliquots.push({ 
            index: i, 
            destination: '', 
            ctcType: '', 
            storageTemperature: '',
            storageBox: '', 
            boxPosition: '',
            freezer: '',
            rack: '',
            location: ''
          });
      } else {
        newAliquots = newAliquots.slice(0, totalRows);
      }
      return { ...prev, [orderId]: { ...current, count: newCount, aliquots: newAliquots } };
    });
  };

  const handleFieldChange = (orderId, field, val) => {
    setAliquotPlan(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: val }
    }));
  };

  const handleAliquotChange = (orderId, index, field, value) => {
    setErrors(prev => ({ ...prev, [`${field}-${orderId}-${index}`]: false }));
    setAliquotPlan(prev => {
      const newAliquots = [...prev[orderId].aliquots];
      newAliquots[index] = { ...newAliquots[index], [field]: value };
      return { ...prev, [orderId]: { ...prev[orderId], aliquots: newAliquots } };
    });
  };

  const toggleRow = (orderId) => setExpandedRows(prev => ({ ...prev, [orderId]: !prev[orderId] }));

  const getParentSampleId = (orderId) => `S-${orderId.replace('ord_', '')}`;
  const getActualSampleId = (orderId, suffix = 'original') => `${getParentSampleId(orderId)}{${suffix}}`;
  const generateAliquotId = (orderId, line) => `${getParentSampleId(orderId)}-CTC${line}`;

  const handleSavePlan = () => {
    let isValid = true;
    const newErrors = {};

    for (const orderId of Object.keys(aliquotPlan)) {
      const plan = aliquotPlan[orderId];
      if (plan.count === '' || plan.count < 1) { 
        isValid = false; 
        newErrors[`count-${orderId}`] = true;
      }
      plan.aliquots.forEach((aliquot, i) => {
        if (!aliquot.ctcType) { 
          isValid = false; 
          newErrors[`ctcType-${orderId}-${i}`] = true;
        }
        if (!aliquot.destination) { 
          isValid = false; 
          newErrors[`destination-${orderId}-${i}`] = true;
        }
        if (aliquot.destination === 'CTC Bank') {
          if (!aliquot.storageTemperature) { isValid = false; newErrors[`storageTemperature-${orderId}-${i}`] = true; }
          if (!aliquot.storageBox) { isValid = false; newErrors[`storageBox-${orderId}-${i}`] = true; }
          if (!aliquot.boxPosition) { isValid = false; newErrors[`boxPosition-${orderId}-${i}`] = true; }
          if (!aliquot.freezer) { isValid = false; newErrors[`freezer-${orderId}-${i}`] = true; }
          if (!aliquot.rack) { isValid = false; newErrors[`rack-${orderId}-${i}`] = true; }
          if (!aliquot.location) { isValid = false; newErrors[`location-${orderId}-${i}`] = true; }
        }
      });
    }

    setErrors(newErrors);

    if (!isValid) {
      toast.error('Please fill out all required fields before saving.');
      return;
    }

    batchOrders.forEach(order => {
      const sampleId = getParentSampleId(order.id);
      const plan = aliquotPlan[order.id];
      addSample({ 
        id: sampleId, 
        orderId: order.id, 
        batchId: batch.id, 
        specimenType: order.specimenType, 
        duplicateCount: plan.count,
        bloodVol: plan.bloodVol
      });
      clearAliquotsBySampleId(sampleId);
      plan.aliquots.forEach((aliquot, i) => {
        addAliquot({ 
          sampleId, 
          index: i, 
          destination: aliquot.destination, 
          ctcType: aliquot.ctcType, 
          storageTemperature: aliquot.storageTemperature,
          storageBox: aliquot.storageBox, 
          boxPosition: aliquot.boxPosition,
          freezer: aliquot.freezer,
          rack: aliquot.rack,
          location: aliquot.location
        });
      });
      updateTestOrder(order.id, { status: 'Processing' });
    });

    updateBatch(batch.id, { status: 'Isolation Complete' });
    toast.success('Aliquot plan saved successfully');
    navigate('/batches');
  };

  const handleSaveBatchDetails = () => {
    updateBatch(batch.id, {
      assignedTo: activeAssignedTo,
      acceptedOn: acceptedOnChecked ? acceptedOnDate : undefined
    });
    toast.success('Batch details saved');
  };

  const handleAcceptBatch = () => {
    updateBatch(batch.id, {
      status: 'Accepted',
      assignedTo: activeAssignedTo,
      acceptedOn: acceptedOnChecked ? acceptedOnDate : new Date().toISOString()
    });
    toast.success('Batch accepted');
    navigate('/batches');
  };

  const handleReassignBatch = () => {
    toast('Re-assign batch workflow not implemented yet');
  };

  const handleToggleVerification = (orderId) => {
    setVerificationStates((current) => ({ ...current, [orderId]: !current[orderId] }));
  };

  const handleDownloadCSV = () => {
    const headers = [
      'Sample ID', 'Blood Vol(ml)', 'Total CTCs', 'Aliquot ID', 'CTC Type', 'Downstream Processing',
      'Temperature', 'Storage Box', 'Box Position', 'Freezer', 'Rack', 'Location'
    ];
    
    const rows = [];
    
    batchOrders.forEach(order => {
      const sampleId = getParentSampleId(order.id);
      const plan = aliquotPlan[order.id] || { count: '', aliquots: [], bloodVol: '' };
      
      if (plan.aliquots && plan.aliquots.length > 0) {
        plan.aliquots.forEach((aliquot, idx) => {
          const aliquotId = generateAliquotId(order.id, idx + 1);
          rows.push([
            sampleId,
            plan.bloodVol || '',
            plan.count || '',
            aliquotId,
            aliquot.ctcType || '',
            aliquot.destination || '',
            aliquot.storageTemperature || '',
            aliquot.storageBox || '',
            aliquot.boxPosition || '',
            aliquot.freezer || '',
            aliquot.rack || '',
            aliquot.location || ''
          ]);
        });
      } else {
        rows.push([
          sampleId,
          plan.bloodVol || '',
          plan.count || '',
          '', '', '', '', '', '', '', '', ''
        ]);
      }
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Batch_${batch.batchNumber}_CTC_Isolation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (batch.status === 'Active') {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-200 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">Batch No.</p>
              <Input value={batch.batchNumber} readOnly className="max-w-xs bg-slate-100 text-sm" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="border-b border-slate-200 bg-slate-50 py-4">
            <CardTitle className="text-base">Batch Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Generated By</Label>
              <Input readOnly value={batch.assignedTo || 'admin@indx.ai'} className="h-10 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Generated on</Label>
              <Input readOnly value={new Date(batch.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} className="h-10 text-sm" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-600">Assigned To</Label>
              <Select value={activeAssignedTo} onValueChange={(value) => setActiveAssignedTo(value)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lab Team">Lab Team</SelectItem>
                  <SelectItem value="Pathologist">Pathologist</SelectItem>
                  <SelectItem value="Technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
              <div className="flex items-center gap-2">
                <Checkbox checked={acceptedOnChecked} onCheckedChange={setAcceptedOnChecked} />
                <Label className="text-xs font-semibold text-slate-600">Accepted On</Label>
              </div>
              <Input
                type="date"
                value={acceptedOnDate}
                onChange={(e) => setAcceptedOnDate(e.target.value)}
                disabled={!acceptedOnChecked}
                className="h-10 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch Samples</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Sample ID</th>
                    <th className="px-4 py-3">Panel/Test Name</th>
                    <th className="px-4 py-3">Specimen</th>
                    <th className="px-4 py-3">Received Date</th>
                    <th className="px-4 py-3">Sample Verification</th>
                    <th className="px-4 py-3">Sample Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {batchOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                      <td className="px-4 py-3 text-slate-600">{order.testName || 'OncoCTC'}</td>
                      <td className="px-4 py-3 text-slate-600">{order.specimenType}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(order.collectionDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={verificationStates[order.id] || false}
                          onCheckedChange={() => handleToggleVerification(order.id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/batches')}>Close</Button>
            <Button className="w-full sm:w-auto" onClick={handleSaveBatchDetails}>Save</Button>
            <Button className="w-full sm:w-auto" onClick={handleAcceptBatch}>Accept Batch</Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleReassignBatch}>Re-Assign Batch</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/batches"><ArrowLeft size={20} /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Batch: {batch.batchNumber}</h1>
            <p className="text-sm text-muted-foreground">CTC Isolation & Aliquoting</p>
          </div>
        </div>
        <Badge variant={statusVariant(batch.status)} className="text-sm px-3 py-1">{batch.status}</Badge>
      </div>

      {/* Batch Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Date Created', value: new Date(batch.createdAt).toLocaleDateString() },
              { label: 'Specimen Type', value: batch.specimenType },
              { label: 'Number of Samples', value: `${batchOrders.length} orders` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-semibold text-sm">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aliquot Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">CTC Isolation & Aliquoting</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast('Upload CSV workflow not implemented yet')}>
              <Upload size={16} className="mr-2" />
              Upload CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
              <Download size={16} className="mr-2" />
              Download CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Sample ID</TableHead>
                <TableHead>Blood Vol(ml)</TableHead>
                <TableHead>Total CTCs</TableHead>
                <TableHead>CTC Type</TableHead>
                <TableHead>Downstream Processing</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Storage Box</TableHead>
                <TableHead>Box Position</TableHead>
                <TableHead>Freezer</TableHead>
                <TableHead>Rack</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchOrders.length > 0 ? batchOrders.map((order) => {
                const isExpanded = expandedRows[order.id];
                const plan = aliquotPlan[order.id] || { count: '', aliquots: [], bloodVol: '', singlet: '', doublet: '', cluster: '' };
                const sampleId = getParentSampleId(order.id);

                return (
                  <React.Fragment key={order.id}>
                    <TableRow className={isExpanded ? 'bg-blue-50/50' : ''}>
                      <TableCell>
                        <button className="text-muted-foreground hover:text-foreground" onClick={() => toggleRow(order.id)}>
                          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">{sampleId}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="any"
                          className="w-20 h-8 text-sm"
                          value={plan.bloodVol || ''}
                          onChange={(e) => handleFieldChange(order.id, 'bloodVol', e.target.value)}
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          className={`w-20 h-8 text-sm ${errors[`count-${order.id}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                          value={plan.count}
                          onChange={(e) => handleCountChange(order.id, e.target.value)}
                          placeholder="—"
                        />
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell colSpan={6}></TableCell>
                    </TableRow>

                    {/* Aliquot sub-rows */}
                    {isExpanded && plan.aliquots.map((aliquot, idx) => {
                      const aliquotId = generateAliquotId(order.id, idx + 1);
                      return (
                        <TableRow key={`${order.id}-${idx}`} className="bg-slate-50">
                          <TableCell></TableCell>
                          <TableCell colSpan={3}>
                            <div className="flex items-center gap-4 py-1 pl-4">
                              <span className="text-sm font-medium text-slate-600 w-36 shrink-0">
                                {aliquotId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select value={aliquot.ctcType} onValueChange={(v) => handleAliquotChange(order.id, idx, 'ctcType', v)}>
                              <SelectTrigger className={`h-8 w-32 text-xs ${errors[`ctcType-${order.id}-${idx}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                <SelectValue placeholder="Select Type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {CTC_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select value={aliquot.destination} onValueChange={(v) => handleAliquotChange(order.id, idx, 'destination', v)}>
                                <SelectTrigger className={`h-8 w-44 text-xs ${errors[`destination-${order.id}-${idx}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {DESTINATIONS.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          {aliquot.destination === 'CTC Bank' ? (
                            <>
                              <TableCell>
                                <Input
                                  className={`h-8 w-24 text-xs ${errors[`storageTemperature-${order.id}-${idx}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  placeholder="Temp"
                                  value={aliquot.storageTemperature || ''}
                                  onChange={(e) => handleAliquotChange(order.id, idx, 'storageTemperature', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  className={`h-8 w-32 text-xs ${errors[`storageBox-${order.id}-${idx}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  placeholder="Storage Box"
                                  value={aliquot.storageBox || ''}
                                  onChange={(e) => handleAliquotChange(order.id, idx, 'storageBox', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  className={`h-8 w-28 text-xs ${errors[`boxPosition-${order.id}-${idx}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  placeholder="Box Position"
                                  value={aliquot.boxPosition || ''}
                                  onChange={(e) => handleAliquotChange(order.id, idx, 'boxPosition', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  className={`h-8 w-24 text-xs ${errors[`freezer-${order.id}-${idx}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  placeholder="Freezer"
                                  value={aliquot.freezer || ''}
                                  onChange={(e) => handleAliquotChange(order.id, idx, 'freezer', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  className={`h-8 w-20 text-xs ${errors[`rack-${order.id}-${idx}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  placeholder="Rack"
                                  value={aliquot.rack || ''}
                                  onChange={(e) => handleAliquotChange(order.id, idx, 'rack', e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  className={`h-8 w-24 text-xs ${errors[`location-${order.id}-${idx}`] ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  placeholder="Location"
                                  value={aliquot.location || ''}
                                  onChange={(e) => handleAliquotChange(order.id, idx, 'location', e.target.value)}
                                />
                              </TableCell>
                            </>
                          ) : (
                            <TableCell colSpan={6}></TableCell>
                          )}
                        </TableRow>
                    )})}
                  </React.Fragment>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground py-10">
                    No samples found for this batch.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 border-t flex justify-end">
          <Button onClick={handleSavePlan}>
            <Save size={16} />
            Save Aliquot Plan
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default BatchDetail;
