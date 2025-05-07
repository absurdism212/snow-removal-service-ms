import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  doc, 
  updateDoc,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';
import { 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Chip
} from '@mui/material';

function Jobs({ user, userRole }) {
  const [jobs, setJobs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    contractId: '',
    address: '',
    scheduledDate: '',
    status: 'pending',
    assignedTo: '',
    notes: ''
  });
  
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch crew members
        const crewQuery = query(collection(db, 'users'), where('role', '==', 'crew'));
        const crewSnapshot = await getDocs(crewQuery);
        const crewList = crewSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCrewMembers(crewList);

        // Fetch contracts
        const contractsQuery = query(collection(db, 'contracts'));
        const contractsSnapshot = await getDocs(contractsQuery);
        const contractsList = contractsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContracts(contractsList);

        // Fetch jobs based on user role
        let jobsQuery;
        if (userRole === 'admin') {
          jobsQuery = query(collection(db, 'jobs'));
        } else if (userRole === 'crew') {
          jobsQuery = query(
            collection(db, 'jobs'), 
            where('assignedTo', '==', user.uid)
          );
        }

        if (jobsQuery) {
          const jobsSnapshot = await getDocs(jobsQuery);
          const jobsList = jobsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setJobs(jobsList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user, userRole]);

  const handleOpenDialog = (job = null) => {
    if (job) {
      setSelectedJob(job);
      setFormData({
        contractId: job.contractId || '',
        address: job.address || '',
        scheduledDate: job.scheduledDate ? new Date(job.scheduledDate.seconds * 1000).toISOString().split('T')[0] : '',
        status: job.status || 'pending',
        assignedTo: job.assignedTo || '',
        notes: job.notes || ''
      });
    } else {
      setSelectedJob(null);
      setFormData({
        contractId: '',
        address: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        assignedTo: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // If contract ID changed, update the address
    if (name === 'contractId') {
      const contract = contracts.find(c => c.id === value);
      if (contract) {
        setFormData(prev => ({
          ...prev,
          contractId: value,
          address: `${contract.address}, ${contract.city}`
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const jobData = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (formData.scheduledDate) {
        jobData.scheduledDate = new Date(formData.scheduledDate);
      }

      if (selectedJob) {
        // Update existing job
        const jobRef = doc(db, 'jobs', selectedJob.id);
        await updateDoc(jobRef, jobData);
      } else {
        // Create new job
        jobData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'jobs'), jobData);
      }

      // Refresh the jobs list
      let jobsQuery;
      if (userRole === 'admin') {
        jobsQuery = query(collection(db, 'jobs'));
      } else if (userRole === 'crew') {
        jobsQuery = query(
          collection(db, 'jobs'), 
          where('assignedTo', '==', user.uid)
        );
      }

      if (jobsQuery) {
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsList);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Error saving job. Please try again.');
    }
  };

  const handleOpenJobDialog = (job) => {
    setSelectedJob(job);
    setCompletionNotes('');
    setSelectedPhoto(null);
    setOpenJobDialog(true);
  };

  const handleCloseJobDialog = () => {
    setOpenJobDialog(false);
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setSelectedPhoto(e.target.files[0]);
    }
  };

  const handleCompleteJob = async () => {
    try {
      if (!selectedJob) return;

      let photoURL = '';
      
      // Upload photo if selected
      if (selectedPhoto) {
        const photoRef = ref(storage, `job-photos/${selectedJob.id}/${Date.now()}`);
        await uploadBytes(photoRef, selectedPhoto);
        photoURL = await getDownloadURL(photoRef);
      }

      // Update job status
      const jobRef = doc(db, 'jobs', selectedJob.id);
      await updateDoc(jobRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completionNotes: completionNotes,
        photoURL: photoURL || '',
        updatedAt: serverTimestamp()
      });

      // Refresh jobs list
      let jobsQuery;
      if (userRole === 'admin') {
        jobsQuery = query(collection(db, 'jobs'));
      } else if (userRole === 'crew') {
        jobsQuery = query(
          collection(db, 'jobs'), 
          where('assignedTo', '==', user.uid)
        );
      }

      if (jobsQuery) {
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsList = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setJobs(jobsList);
      }
      
      handleCloseJobDialog();
    } catch (error) {
      console.error('Error completing job:', error);
      alert('Error completing job. Please try again.');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'in-progress':
        return <Chip label="In Progress" color="info" size="small" />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Jobs Management</Typography>
        {userRole === 'admin' && (
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Create New Job
          </Button>
        )}
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.address}</TableCell>
                <TableCell>
                  {job.scheduledDate?.seconds ? new Date(job.scheduledDate.seconds * 1000).toLocaleDateString() : 'Not scheduled'}
                </TableCell>
                <TableCell>{getStatusChip(job.status)}</TableCell>
                <TableCell>
                  {job.assignedTo ? crewMembers.find(c => c.id === job.assignedTo)?.name || 'Unknown' : 'Not assigned'}
                </TableCell>
                <TableCell>
                  {userRole === 'admin' && (
                    <Button size="small" onClick={() => handleOpenDialog(job)} sx={{ mr: 1 }}>
                      Edit
                    </Button>
                  )}
                  {userRole === 'crew' && job.status !== 'completed' && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="success" 
                      onClick={() => handleOpenJobDialog(job)}
                    >
                      Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Job Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedJob ? 'Edit Job' : 'Create New Job'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="contract-select-label">Contract</InputLabel>
                <Select
                  labelId="contract-select-label"
                  id="contractId"
                  name="contractId"
                  value={formData.contractId}
                  label="Contract"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>Select a contract</em>
                  </MenuItem>
                  {contracts.map((contract) => (
                    <MenuItem key={contract.id} value={contract.id}>
                      {contract.customerName} - {contract.address}, {contract.city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled Date"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="crew-select-label">Assign To</InputLabel>
                <Select
                  labelId="crew-select-label"
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  label="Assign To"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>Not assigned</em>
                  </MenuItem>
                  {crewMembers.map((crew) => (
                    <MenuItem key={crew.id} value={crew.id}>
                      {crew.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedJob ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Complete Job Dialog */}
      <Dialog open={openJobDialog} onClose={handleCloseJobDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body1">
                Address: {selectedJob?.address}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Scheduled: {selectedJob?.scheduledDate?.seconds 
                  ? new Date(selectedJob.scheduledDate.seconds * 1000).toLocaleDateString() 
                  : 'Not scheduled'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Upload Verification Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>
              {selectedPhoto && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {selectedPhoto.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Completion Notes"
                multiline
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobDialog}>Cancel</Button>
          <Button 
            onClick={handleCompleteJob} 
            variant="contained" 
            color="success"
            disabled={!selectedPhoto}
          >
            Mark as Completed
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Jobs;