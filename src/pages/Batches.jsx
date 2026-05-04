import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const statusVariant = (status) => {
  switch (status) {
    case 'Active': return 'info';
    case 'Isolation Complete': return 'success';
    default: return 'secondary';
  }
};

const Batches = () => {
  const batches = useStore((state) => state.batches);
  const deleteBatch = useStore((state) => state.deleteBatch);
  const updateTestOrder = useStore((state) => state.updateTestOrder);
  const navigate = useNavigate();

  const handleDeleteBatch = (batchId, sampleIds) => {
    if (window.confirm('Are you sure you want to delete this batch? This will release its samples back to the pool.')) {
      if (sampleIds) {
        sampleIds.forEach(id => updateTestOrder(id, { status: 'Pending' }));
      }
      deleteBatch(batchId);
      toast.success('Batch deleted successfully');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batches</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage CTC isolation batches</p>
        </div>
        <Button onClick={() => navigate('/batches/new')}>
          <Plus size={16} />
          Create New Batch
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Batches</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Number</TableHead>
                <TableHead>Specimen Type</TableHead>
                <TableHead>Samples</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <Link
                        to={`/batches/${batch.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {batch.batchNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{batch.specimenType}</TableCell>
                    <TableCell>{batch.sampleIds ? batch.sampleIds.length : 0}</TableCell>
                    <TableCell>{new Date(batch.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(batch.status)}>{batch.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBatch(batch.id, batch.sampleIds)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    No batches found. Click "Create New Batch" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Batches;
