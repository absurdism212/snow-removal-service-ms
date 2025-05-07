import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
        const customersSnapshot = await getDocs(customersQuery);
        const customersList = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCustomers(customersList);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Customers</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/register')}>
          Add New Customer
        </Button>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  {customer.createdAt?.seconds 
                    ? new Date(customer.createdAt.seconds * 1000).toLocaleDateString() 
                    : 'Unknown'}
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => navigate(`/contracts?customerId=${customer.id}`)}
                  >
                    View Contracts
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default CustomerList;