import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Contracts from './components/Contracts';
import Jobs from './components/Jobs';
import CustomerList from './components/CustomerList';
import CustomerServices from './components/CustomerServices';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            console.warn('User document not found in Firestore');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
      return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" />;
    }

    return element;
  };

  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {user && <Navbar user={user} userRole={userRole} />}
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route 
            path="/register" 
            element={<ProtectedRoute element={<Register />} allowedRoles={['admin']} />} 
          />
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute element={<Dashboard user={user} userRole={userRole} />} />} 
          />
          <Route 
            path="/contracts" 
            element={<ProtectedRoute element={<Contracts />} allowedRoles={['admin']} />} 
          />
          <Route 
            path="/jobs" 
            element={<ProtectedRoute element={<Jobs user={user} userRole={userRole} />} allowedRoles={['admin', 'crew']} />} 
          />
          <Route 
            path="/customers" 
            element={<ProtectedRoute element={<CustomerList />} allowedRoles={['admin']} />} 
          />
          <Route 
            path="/my-services" 
            element={<ProtectedRoute element={<CustomerServices user={user} />} allowedRoles={['customer']} />} 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;