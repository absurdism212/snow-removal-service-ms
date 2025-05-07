import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
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
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    address: '',
    city: '',
    snowThreshold: 2,
    isPriority: false,
    specialNotes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch customers
      const customersQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
      const customersSnapshot = await getDocs(customersQuery);
      const customersList = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customersList);

      // Fetch contracts
      const contractsQuery = query(collection(db, 'contracts'));
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContracts(contractsList);
    };

    fetchData();
  }, []);

  const handleOpenDialog = (contract = null) => {
    if (contract) {
      setSelectedContract(contract);
      setFormData({
        customerId: contract.customerId,
        customerName: contract.customerName,
        address: contract.address,
        city: contract.city,
        snowThreshold: contract.snowThreshold,
        isPriority: contract.isPriority,
        specialNotes: contract.specialNotes || ''
      });
    } else {
      setSelectedContract(null);
      setFormData({
        customerId: '',
        customerName: '',
        address: '',
        city: '',
        snowThreshold: 2,
        isPriority: false,
        specialNotes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // If customer ID changed, update the customer name
    if (name === 'customerId') {
      const customer = customers.find(c => c.id === value);
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customerId: value,
          customerName: customer.name
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedContract) {
        // Update existing contract
        const contractRef = doc(db, 'contracts', selectedContract.id);
        await updateDoc(contractRef, {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new contract
        await addDoc(collection(db, 'contracts'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Refresh the contracts list
      const contractsQuery = query(collection(db, 'contracts'));
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsList = contractsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContracts(contractsList);
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving contract:', error);
      alert('Error saving contract. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Contracts Management</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add New Contract
        </Button>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Snow Threshold</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.customerName}</TableCell>
                <TableCell>{contract.address}</TableCell>
                <TableCell>{contract.city}</TableCell>
                <TableCell>{contract.snowThreshold} inches</TableCell>
                <TableCell>{contract.isPriority ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpenDialog(contract)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No contracts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Add/Edit Contract Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedContract ? 'Edit Contract' : 'Add New Contract'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Customer"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Service Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Snow Threshold (inches)"
                name="snowThreshold"
                type="number"
                value={formData.snowThreshold}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isPriority}
                    onChange={handleInputChange}
                    name="isPriority"
                  />
                }
                label="Priority Customer"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Notes"
                name="specialNotes"
                multiline
                rows={3}
                value={formData.specialNotes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedContract ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Contracts;