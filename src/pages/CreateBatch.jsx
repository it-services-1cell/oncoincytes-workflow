import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import useStore from '../store/useStore';

const sampleTypes = ['CTC', 'Whole Blood', 'Plasma'];
const specimens = ['CTC', 'Blood', 'Serum'];
const containers = ['Tube', 'Vial', 'Tube with preservative'];
const sampleAnalytes = ['TP53', 'BRCA1', 'EGFR'];
const sortColumns = ['Sample ID', 'Collection Date', 'Priority'];
const sortOrders = ['Ascending', 'Descending'];
const assignmentStatuses = ['Pending', 'Assigned', 'Completed'];
const sampleStatusOptions = ['Accessioned', 'Accessioned with Deviation'];

const CreateBatch = () => {
  const navigate = useNavigate();
  const testOrders = useStore((state) => state.testOrders);
  const [sampleType, setSampleType] = useState('');
  const [specimen, setSpecimen] = useState('');
  const [sampleContainer, setSampleContainer] = useState('');
  const [sampleStatus, setSampleStatus] = useState(['Accessioned', 'Accessioned with Deviation']);
  const [sampleId, setSampleId] = useState('');
  const [searchExact, setSearchExact] = useState(true);
  const [sampleAnalyte, setSampleAnalyte] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [accessionFrom, setAccessionFrom] = useState('');
  const [accessionTo, setAccessionTo] = useState('');
  const [assignmentStatus, setAssignmentStatus] = useState('Pending');
  const addBatch = useStore((state) => state.addBatch);
  const updateTestOrder = useStore((state) => state.updateTestOrder);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState([]);
  const [batchSampleIds, setBatchSampleIds] = useState([]);
  const [selectedBatchSampleIds, setSelectedBatchSampleIds] = useState([]);
  const [showBatchGeneration, setShowBatchGeneration] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');

  const toggleSampleStatus = (status) => {
    setSampleStatus((current) =>
      current.includes(status)
        ? current.filter((item) => item !== status)
        : [...current, status]
    );
  };

  const handleSearch = () => {
    const getDateValue = (date) => (date ? new Date(date).setHours(0, 0, 0, 0) : null);
    const fromDate = getDateValue(accessionFrom);
    const toDate = getDateValue(accessionTo);

    const statusMap = {
      Accessioned: ['Pending', 'Completed'],
      'Accessioned with Deviation': ['Processing']
    };

    const assignmentMap = {
      Pending: 'Pending',
      Assigned: 'Processing',
      Completed: 'Completed'
    };

    const filtered = testOrders
      .filter((order) => {
        if (sampleType && order.specimenType.toLowerCase() !== sampleType.toLowerCase()) {
          return false;
        }
        if (specimen && order.specimenType.toLowerCase() !== specimen.toLowerCase()) {
          return false;
        }
        if (sampleStatus.length > 0) {
          const allowedStatuses = sampleStatus.flatMap((status) => statusMap[status] || []);
          if (!allowedStatuses.includes(order.status)) {
            return false;
          }
        }
        if (sampleId) {
          const comparison = order.id.toLowerCase();
          if (searchExact) {
            if (comparison !== sampleId.toLowerCase()) {
              return false;
            }
          } else if (!comparison.includes(sampleId.toLowerCase())) {
            return false;
          }
        }
        if (accessionFrom || accessionTo) {
          const orderDate = new Date(order.collectionDate).setHours(0, 0, 0, 0);
          if (fromDate !== null && orderDate < fromDate) {
            return false;
          }
          if (toDate !== null && orderDate > toDate) {
            return false;
          }
        }
        if (assignmentStatus && assignmentStatus !== 'Pending') {
          const mapped = assignmentMap[assignmentStatus];
          if (mapped && order.status !== mapped) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (!sortColumn) return 0;
        if (sortColumn === 'Sample ID') {
          return sortOrder === 'Descending'
            ? b.id.localeCompare(a.id)
            : a.id.localeCompare(b.id);
        }
        if (sortColumn === 'Collection Date') {
          return sortOrder === 'Descending'
            ? new Date(b.collectionDate) - new Date(a.collectionDate)
            : new Date(a.collectionDate) - new Date(b.collectionDate);
        }
        if (sortColumn === 'Priority') {
          return sortOrder === 'Descending'
            ? b.status.localeCompare(a.status)
            : a.status.localeCompare(b.status);
        }
        return 0;
      });

    setSearchResults(filtered);
    setSelectedSampleIds([]);
  };

  const batchSamples = testOrders.filter((order) => batchSampleIds.includes(order.id));

  const handleSelectSample = (sampleId) => {
    setSelectedSampleIds((current) =>
      current.includes(sampleId)
        ? current.filter((id) => id !== sampleId)
        : [...current, sampleId]
    );
  };

  const handleSelectAllSamples = (checked) => {
    setSelectedSampleIds(checked ? searchResults.map((order) => order.id) : []);
  };

  const handleAddToBatch = () => {
    if (selectedSampleIds.length === 0) {
      toast('Select at least one sample to add to batch', { icon: '⚠️' });
      return;
    }

    const addedIds = Array.from(new Set([...batchSampleIds, ...selectedSampleIds]));
    setBatchSampleIds(addedIds);
    setSelectedBatchSampleIds(addedIds);
    toast.success(`${selectedSampleIds.length} sample(s) added to batch`);
    setSelectedSampleIds([]);
    setShowBatchGeneration(true);
  };

  const handleToggleBatchSample = (sampleId) => {
    setSelectedBatchSampleIds((current) =>
      current.includes(sampleId)
        ? current.filter((id) => id !== sampleId)
        : [...current, sampleId]
    );
  };

  const handleRemoveBatchSample = (sampleId) => {
    setBatchSampleIds((current) => current.filter((id) => id !== sampleId));
    setSelectedBatchSampleIds((current) => current.filter((id) => id !== sampleId));
    toast.success('Sample removed from batch');
  };

  const handleSelectAllBatchSamples = (checked) => {
    setSelectedBatchSampleIds(checked ? batchSamples.map((order) => order.id) : []);
  };

  const handleSaveBatch = () => {
    if (selectedBatchSampleIds.length === 0) {
      toast('Select at least one sample to save the batch', { icon: '⚠️' });
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSaveBatch = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const batchNumber = `BATCH-${dateStr}-${Math.floor(Math.random() * 900) + 100}`;

    addBatch({ batchNumber, specimenType: 'CTC', status: 'Active', sampleIds: selectedBatchSampleIds, assignedTo, notes: '' });
    selectedBatchSampleIds.forEach((id) => updateTestOrder(id, { status: 'In Progress' }));

    setShowSaveConfirm(false);
    toast.success('Batch saved successfully');
    navigate('/batches');
  };

  const handleBackToSearch = () => {
    setShowBatchGeneration(false);
  };

  if (showBatchGeneration) {
    return (
      <div className="p-6 bg-slate-100 min-h-screen">
        <div className="mx-auto max-w-[1200px]">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Batch Generation Information</h1>
                <p className="text-sm text-slate-500 mt-1">Selected samples have been added to batch and are ready for review.</p>
              </div>
              <Button variant="outline" onClick={handleBackToSearch}>Back to Search</Button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Generated By</Label>
                <Input readOnly value="admin@indx.ai" className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Generated On</Label>
                <Input readOnly value={new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} className="h-10 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600">Assigned To</Label>
                <Select value={assignedTo} onValueChange={(value) => setAssignedTo(value)}>
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
            </CardContent>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <Checkbox
                          checked={selectedBatchSampleIds.length === batchSamples.length && batchSamples.length > 0}
                          indeterminate={selectedBatchSampleIds.length > 0 && selectedBatchSampleIds.length < batchSamples.length}
                          onCheckedChange={handleSelectAllBatchSamples}
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">Sample ID</th>
                      <th className="px-4 py-3 font-semibold">PUID</th>
                      <th className="px-4 py-3 font-semibold">Specimen</th>
                      <th className="px-4 py-3 font-semibold">Panel/Test Name</th>
                      <th className="px-4 py-3 font-semibold">Sample Category</th>
                      <th className="px-4 py-3 font-semibold">Received Date</th>
                      <th className="px-4 py-3 font-semibold">Sample Container</th>
                      <th className="px-4 py-3 font-semibold">Sample Analyte</th>
                      <th className="px-4 py-3 font-semibold">Sample Classification</th>
                      <th className="px-4 py-3 font-semibold">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {batchSamples.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedBatchSampleIds.includes(order.id)}
                            onCheckedChange={() => handleToggleBatchSample(order.id)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                        <td className="px-4 py-3 text-slate-600">{order.patientID}</td>
                        <td className="px-4 py-3 text-slate-600">{order.specimenType}</td>
                        <td className="px-4 py-3 text-slate-600">{order.testName}</td>
                        <td className="px-4 py-3 text-slate-600">Service Sample</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(order.collectionDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="px-4 py-3 text-slate-600">Cryovial (Cryovial)</td>
                        <td className="px-4 py-3 text-slate-600">CTC</td>
                        <td className="px-4 py-3 text-slate-600">Regular</td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" className="text-red-600 hover:bg-slate-100" onClick={() => handleRemoveBatchSample(order.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row">
              <div className="text-sm text-slate-600">
                {selectedBatchSampleIds.length} selected sample(s) ready to save.
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button variant="outline" onClick={handleBackToSearch}>Back to Search</Button>
                <Button onClick={handleSaveBatch}>Save Batch</Button>
              </div>
            </CardFooter>
          </Card>

          {showSaveConfirm ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
              <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">Confirm Save Batch</h2>
                </div>
                <div className="space-y-4 px-6 py-5 text-sm text-slate-700">
                  <p>Save <span className="font-semibold text-slate-900">{selectedBatchSampleIds.length}</span> selected sample(s) into a new batch?</p>
                  <p><span className="font-semibold">Assigned To:</span> {assignedTo || 'Not assigned yet'}</p>
                  <p className="text-slate-500">Once saved, selected samples will be updated to In Progress and the batch will be created.</p>
                </div>
                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowSaveConfirm(false)}>
                    Cancel
                  </Button>
                  <Button className="w-full sm:w-auto" onClick={handleConfirmSaveBatch}>
                    Confirm Save
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="mx-auto max-w-[1200px]">
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Search Samples</h1>
            </div>
            <ChevronUp className="text-slate-500" size={20} />
          </CardHeader>

          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Sample Type</Label>
              <Select value={sampleType} onValueChange={(value) => setSampleType(value)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select Sample type" />
                </SelectTrigger>
                <SelectContent>
                  {sampleTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Specimen</Label>
              <Select value={specimen} onValueChange={(value) => setSpecimen(value)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select Specimen" />
                </SelectTrigger>
                <SelectContent>
                  {specimens.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Sample Container</Label>
              <Select value={sampleContainer} onValueChange={(value) => setSampleContainer(value)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select Sample Container" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Sample Status</Label>
              <div className="rounded-md border border-input bg-white p-3 text-sm text-slate-700">
                <div className="flex flex-wrap gap-2">
                  {sampleStatusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleSampleStatus(status)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${sampleStatus.includes(status)
                        ? 'border-blue-600 bg-blue-100 text-blue-700'
                        : 'border-slate-300 bg-slate-100 text-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                Sample ID
                <span className="flex items-center gap-1 text-xs font-normal text-slate-500">
                  <Checkbox checked={searchExact} onCheckedChange={() => setSearchExact(!searchExact)} />
                  Search Exact
                </span>
              </Label>
              <Input
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                placeholder="Enter Sample ID"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Sample Analyte</Label>
              <Select value={sampleAnalyte} onValueChange={(value) => setSampleAnalyte(value)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select Sample Analyte" />
                </SelectTrigger>
                <SelectContent>
                  {sampleAnalytes.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Sort By</Label>
              <div className="grid grid-cols-2 gap-3">
                <Select value={sortColumn} onValueChange={(value) => setSortColumn(value)}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Sort Column" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortColumns.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select Sort Order" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOrders.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Sample Accession Date</Label>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                <Input
                  type="date"
                  value={accessionFrom}
                  onChange={(e) => setAccessionFrom(e.target.value)}
                  className="h-10 text-sm"
                />
                <Input
                  type="date"
                  value={accessionTo}
                  onChange={(e) => setAccessionTo(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600">Sample Assignment Status</Label>
              <Select value={assignmentStatus} onValueChange={(value) => setAssignmentStatus(value)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select Assignment Status" />
                </SelectTrigger>
                <SelectContent>
                  {assignmentStatuses.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4">
            <Button
              className="mx-auto block px-6 py-3"
              size="lg"
              onClick={handleSearch}
            >
              Search Sample
            </Button>
          </CardFooter>
        </Card>

        <Card className="mt-4 border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Search Results</p>
              <p className="text-xs text-slate-500">{searchResults.length} sample(s) matched your criteria.</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {searchResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <Checkbox
                          checked={searchResults.length > 0 && selectedSampleIds.length === searchResults.length}
                          indeterminate={selectedSampleIds.length > 0 && selectedSampleIds.length < searchResults.length}
                          onCheckedChange={handleSelectAllSamples}
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold">Sample ID</th>
                      <th className="px-4 py-3 font-semibold">Order ID</th>
                      <th className="px-4 py-3 font-semibold">Patient Name</th>
                      <th className="px-4 py-3 font-semibold">Test Name</th>
                      <th className="px-4 py-3 font-semibold">Specimen</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Collection Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {searchResults.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={selectedSampleIds.includes(order.id)}
                            onCheckedChange={() => handleSelectSample(order.id)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                        <td className="px-4 py-3 text-slate-600">ORD-{Math.floor(100000 + Math.random() * 900000)}</td>
                        <td className="px-4 py-3 text-slate-600">{order.patientName}</td>
                        <td className="px-4 py-3 text-slate-600">OncoIncytes</td>
                        <td className="px-4 py-3 text-slate-600">{order.specimenType}</td>
                        <td className="px-4 py-3 text-slate-600">{order.status}</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(order.collectionDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-sm text-slate-500">No samples match the current filters. Adjust the search criteria and try again.</div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              {batchSampleIds.length > 0
                ? `${batchSampleIds.length} sample(s) currently added to batch`
                : 'No samples added to batch yet'}
            </div>
            <Button
              className="w-full sm:w-auto"
              onClick={handleAddToBatch}
            >
              Add Samples to Batch
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
};

export default CreateBatch;
