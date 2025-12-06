import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../utils/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState('viewer');
  const [backendConnected, setBackendConnected] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || 'viewer');
    fetchData();
  }, []);

  // Test backend connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        await api.get('/health');
        setBackendConnected(true);
      } catch (err) {
        setBackendConnected(false);
        console.error('Backend connection failed:', err);
      }
    };
    testConnection();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [salesRes, monthlyRes, regionalRes, productRes, statsRes] = await Promise.all([
        api.get('/sales?limit=10'),
        api.get('/sales/analytics/monthly'),
        api.get('/sales/analytics/regional'),
        api.get('/sales/analytics/products'),
        api.get('/sales/analytics/stats'),
      ]);

      setSales(salesRes.data.sales || []);
      setMonthlyData(monthlyRes.data || []);
      setRegionalData(regionalRes.data || []);
      setProductData(productRes.data || []);
      setStats(statsRes.data || {});
      
      console.log('Data fetched:', {
        sales: salesRes.data.sales?.length || 0,
        monthly: monthlyRes.data?.length || 0,
        regional: regionalRes.data?.length || 0,
        products: productRes.data?.length || 0,
        stats: statsRes.data
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch data';
      setError(errorMsg);
      console.error('Error fetching data:', err);
      // Set empty defaults on error
      setSales([]);
      setMonthlyData([]);
      setRegionalData([]);
      setProductData([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleCSVUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          await api.post('/sales/upload', { sales: results.data });
          setFile(null);
          document.getElementById('csv-upload').value = '';
          alert('CSV uploaded successfully!');
          fetchData();
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to upload CSV');
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        setError('Error parsing CSV: ' + error.message);
        setUploading(false);
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  if (loading) {
    return (
      <Container>
        <Box textAlign="center" mt={4}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sales Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Role: {userRole}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {!backendConnected && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Cannot connect to backend server. Please ensure the backend is running on port 5000.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
            {error.includes('Failed to fetch') && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Make sure the backend server is running: <code>cd backend && npm start</code>
              </Typography>
            )}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ${stats.totalSales?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sales
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.totalCount || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ${stats.averageSale?.toFixed(2) || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Sale
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ${stats.maxSale?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Max Sale
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* CSV Upload Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Upload CSV File
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV file to add sales data and view analytics. All authenticated users can upload data.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              id="csv-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="csv-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Select CSV
              </Button>
            </label>
            {file && (
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {file.name}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={handleCSVUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            CSV format: product, amount, date, region, customer
            <br />
            Sample file location: <code>sample-sales.csv</code> in the project root
          </Typography>
        </Paper>

        {/* Empty State Message */}
        {!loading && sales.length === 0 && monthlyData.length === 0 && !error && (
          <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              No Sales Data Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Upload a CSV file to get started with sales analytics.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the CSV upload section above to add sales data.
            </Typography>
          </Paper>
        )}

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Monthly Sales Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Sales
              </Typography>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Total Sales ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No monthly data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Regional Sales Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sales by Region
              </Typography>
              {regionalData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Total Sales ($)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No regional data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Top Products Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Products
              </Typography>
              {productData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) =>
                        `${_id}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {productData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No product data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent Sales Table */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Sales
              </Typography>
              {sales.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Region</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale._id}>
                          <TableCell>{sale.product}</TableCell>
                          <TableCell>${sale.amount.toLocaleString()}</TableCell>
                          <TableCell>{sale.region}</TableCell>
                          <TableCell>
                            {new Date(sale.date).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No sales records found</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;

