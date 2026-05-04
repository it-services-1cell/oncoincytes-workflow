import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FormField = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-slate-700">{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

const NewTestOrder = () => {
  const navigate = useNavigate();
  const addTestOrder = useStore((state) => state.addTestOrder);

  const [formData, setFormData] = useState({
    patientName: '', patientDOB: '', patientID: '',
    physicianName: '', hospitalName: '', specimenType: '', collectionDate: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
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
      addTestOrder({ ...formData, status: 'Pending' });
      toast.success('Test order created successfully');
      navigate('/test-orders');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/test-orders"><ArrowLeft size={20} /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Test Order</h1>
          <p className="text-sm text-muted-foreground">Create a new OncoIncyte test order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-700">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Full Name" error={errors.patientName}>
              <Input
                placeholder="e.g. John Doe"
                value={formData.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                className={errors.patientName ? 'border-destructive' : ''}
              />
            </FormField>
            <FormField label="Date of Birth" error={errors.patientDOB}>
              <Input
                type="date"
                value={formData.patientDOB}
                onChange={(e) => handleChange('patientDOB', e.target.value)}
                className={errors.patientDOB ? 'border-destructive' : ''}
              />
            </FormField>
            <FormField label="Patient ID" error={errors.patientID}>
              <Input
                placeholder="e.g. PID-12345"
                value={formData.patientID}
                onChange={(e) => handleChange('patientID', e.target.value)}
                className={errors.patientID ? 'border-destructive' : ''}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Physician */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-700">Requesting Physician</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Physician Full Name" error={errors.physicianName}>
              <Input
                placeholder="e.g. Dr. Emily Chen"
                list="physician-list"
                value={formData.physicianName}
                onChange={(e) => handleChange('physicianName', e.target.value)}
                className={errors.physicianName ? 'border-destructive' : ''}
              />
              <datalist id="physician-list">
                <option value="Dr. Emily Chen" />
                <option value="Dr. Michael Rodriguez" />
                <option value="Dr. Sarah Lee" />
                <option value="Dr. David Kim" />
              </datalist>
            </FormField>
            <FormField label="Hospital / Institution" error={errors.hospitalName}>
              <Input
                placeholder="e.g. General Memorial Hospital"
                list="hospital-list"
                value={formData.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                className={errors.hospitalName ? 'border-destructive' : ''}
              />
              <datalist id="hospital-list">
                <option value="General Memorial Hospital" />
                <option value="City Cancer Center" />
                <option value="University Hospital" />
                <option value="Regional Medical Center" />
              </datalist>
            </FormField>
          </CardContent>
        </Card>

        {/* Test Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-slate-700">Test Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Test Name">
              <div className="flex h-10 items-center px-3 rounded-md border bg-muted text-muted-foreground text-sm">
                OncoIncyte
              </div>
            </FormField>
            <FormField label="Specimen Type" error={errors.specimenType}>
              <Select value={formData.specimenType} onValueChange={(v) => handleChange('specimenType', v)}>
                <SelectTrigger className={errors.specimenType ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a specimen type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cfDNA">cfDNA (cell-free DNA)</SelectItem>
                  <SelectItem value="ctDNA">ctDNA (circulating tumour cell DNA)</SelectItem>
                  <SelectItem value="CTC">CTC (circulating tumour cell)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Collection Date" error={errors.collectionDate}>
              <Input
                type="date"
                value={formData.collectionDate}
                onChange={(e) => handleChange('collectionDate', e.target.value)}
                className={errors.collectionDate ? 'border-destructive' : ''}
              />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/test-orders')}>
            Cancel
          </Button>
          <Button type="submit">
            <Save size={16} />
            Submit Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewTestOrder;
