import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box 
} from '@mui/material';

function Navbar({ user, userRole }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Snow Removal System
        </Typography>
        {user ? (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              {(userRole === 'admin') && (
                <>
                  <Button color="inherit" onClick={() => navigate('/customers')}>
                    Customers
                  </Button>
                  <Button color="inherit" onClick={() => navigate('/contracts')}>
                    Contracts
                  </Button>
                  <Button color="inherit" onClick={() => navigate('/register')}>
                    Add User
                  </Button>
                </>
              )}
              {(userRole === 'admin' || userRole === 'crew') && (
                <Button color="inherit" onClick={() => navigate('/jobs')}>
                  Jobs
                </Button>
              )}
              {userRole === 'customer' && (
                <Button color="inherit" onClick={() => navigate('/my-services')}>
                  My Services
                </Button>
              )}
            </Box>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;