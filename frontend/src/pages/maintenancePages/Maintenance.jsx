import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/Store/AuthContext';
import './maintenance.css';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ToastContainer from '../components/toasts/ToastContainer'
import { toast } from '../../modules/Store/ToastStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SEVERITY_COLORS = {
  critical: '#ff4d4f',
  error: '#ff7875',
  warning: '#ffc069',
  info: '#69c0ff',
  database: '#9254de',
  api: '#36cfc9',
  auth: '#ff9c6e',
  payment: '#ffd666',
  other: '#bae637'
};

const START_TIME = new Date(2025, 4, 5, 12, 0, 0);
//console.log(START);

export default function MaintenancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [faultTrends, setFaultTrends] = useState([]);
  const [machineErrors, setMachineErrors] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [activityTypeData, setActivityTypeData] = useState([]);
  const [timeRange, setTimeRange] = useState('minutes'); 
  const [errorStats, setErrorStats] = useState({ 
    total: 0, 
    critical: 0, 
    error: 0, 
    warning: 0,
    info: 0,
    machines: {},
    components: {},
    users: {},
    timeSlots: {}
  });

const processErrorData = (errorData, existingData = {}) => {
  if (!errorData || !Array.isArray(errorData)) {
    console.error('Invalid error data:', errorData);
    return {
      classifiedErrors: [],
      stats: existingData,
      timeSeriesData: existingData.timeSlots ? 
        Object.entries(existingData.timeSlots)
          .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
          .map(([time, data]) => ({ time, ...data })) 
        : []
    };
  }

  // Initialize data structures with proper defaults
  const machines = { ...(existingData.machines || {}) };
  const components = { ...(existingData.components || {}) };
  const users = { ...(existingData.users || {}) };
  const timeSlots = { ...(existingData.timeSlots || {}) };
  
  let total = existingData.total || 0;
  let critical = existingData.critical || 0;
  let error = existingData.error || 0;
  let warning = existingData.warning || 0;
  let info = existingData.info || 0;

  const classifiedErrors = errorData.map(error => {
    try {
      // Skip if error is null/undefined or doesn't have required properties
      if (!error || typeof error !== 'object') {
        return null;
      }

      // Safely extract properties with defaults
      const machine = error?.location?.component || error?.metadata?.machine || 'System';
      const component = error?.location?.component || 'Unknown';
      const username = error?.user?.username || 'Anonymous';
      const errorMessage = error?.message || 'No message available';
      const errorLevel = (error?.level || 'info').toLowerCase();
      
      // Get timestamp safely
      const errorTimestamp = error?.timestamp ? new Date(error.timestamp) : new Date();
      const errorMinutes = errorTimestamp.getMinutes();
      const fiveMinInterval = Math.floor(errorMinutes / 5) * 5;
      const timeSlot = `${errorTimestamp.getHours()}:${String(fiveMinInterval).padStart(2, '0')}`;

      // Initialize time slot if it doesn't exist
      if (!timeSlots[timeSlot]) {
        timeSlots[timeSlot] = { 
          total: 0, 
          critical: 0, 
          error: 0, 
          warning: 0, 
          info: 0,
          timestamp: errorTimestamp
        };
        
        // Keep only recent time slots
        const slotKeys = Object.keys(timeSlots);
        if (slotKeys.length > 8) {
          const oldestSlot = slotKeys.sort((a, b) => a.localeCompare(b))[0];
          delete timeSlots[oldestSlot];
        }
      }

      let severity;
      switch(errorLevel) {
        case 'critical':
          severity = { level: 'critical', weight: 4, color: SEVERITY_COLORS.critical };
          critical++;
          timeSlots[timeSlot].critical++;
          break;
        case 'error':
          severity = { level: 'error', weight: 3, color: SEVERITY_COLORS.error };
          error++;
          timeSlots[timeSlot].error++;
          break;
        case 'warning':
          severity = { level: 'warning', weight: 2, color: SEVERITY_COLORS.warning };
          warning++;
          timeSlots[timeSlot].warning++;
          break;
        default:
          severity = { level: 'info', weight: 1, color: SEVERITY_COLORS.info };
          info++;
          timeSlots[timeSlot].info++;
      }
      
      total++;
      timeSlots[timeSlot].total++;

      // Update machine stats with null checks
      machines[machine] = machines[machine] || { total: 0, critical: 0, error: 0, warning: 0, info: 0 };
      machines[machine].total++;
      machines[machine][severity.level] = (machines[machine][severity.level] || 0) + 1;

      // Update component stats
      components[component] = components[component] || { total: 0, critical: 0, error: 0, warning: 0, info: 0 };
      components[component].total++;
      components[component][severity.level] = (components[component][severity.level] || 0) + 1;

      // Update user stats
      users[username] = users[username] || { total: 0, critical: 0, error: 0, warning: 0, info: 0 };
      users[username].total++;
      users[username][severity.level] = (users[username][severity.level] || 0) + 1;

      return {
        ...error,
        machine,
        component,
        username,
        severity,
        timestamp: errorTimestamp,
        formattedTime: formatTime(errorTimestamp),
        value: severity.weight,
        color: severity.color,
        shortMessage: errorMessage.length > 50 
          ? `${errorMessage.substring(0, 50)}...` 
          : errorMessage,
        timeSlot
      };
    } catch (err) {
      toast.error('Error processing error entry:', error, err);
      return null;
    }
  }).filter(error => error !== null);

  const stats = { 
    total, 
    critical, 
    error, 
    warning, 
    info,
    machines,
    components,
    users,
    timeSlots
  };

  const timeSeries = Object.entries(timeSlots)
    .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
    .map(([time, data]) => {
      const sampleError = classifiedErrors.find(err => err.timeSlot === time);
      return {
        time,
        ...data,
        ...(sampleError ? {
          errorDetails: {
            machine: sampleError.machine,
            component: sampleError.component,
            username: sampleError.username,
            message: sampleError.shortMessage,
            stack: sampleError.stack
          }
        } : {})
      };
    });

    return {
      classifiedErrors,
      stats,
      timeSeriesData: timeSeries
    };
  };


  const formatTime = (date) => {
    switch(timeRange) {
      case 'minutes': 
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      case 'hours':
        return `${date.getHours()}h`;
      case 'days':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'weeks':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      default:
        return date.toLocaleTimeString();
    }
  };

  useEffect(() => {
    const fetchErrorData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/maintenance/errors/log`, {
          withCredentials: true,
          headers: {'Content-Type': 'application/json'}
        });

        if (!response.data) return;

        let errorData = [];
        if (Array.isArray(response.data)) {
          errorData = response.data;
        } else if (response.data.errorLogs) {
          errorData = response.data.errorLogs;
        } else if (response.data.errorsData) { 
          errorData = response.data.errorsData;
        }

        if (errorData.length === 0) {
          toast.error('No errors found');
          return;
        }

        const { classifiedErrors, stats, timeSeriesData } = processErrorData(errorData, errorStats);
        
        setErrorStats(stats);
        setMachineErrors(stats.machines);
        setFaultTrends(classifiedErrors);
        setTimeSeriesData(timeSeriesData);

        setStatusData([
          { name: 'Critical', value: stats.critical, color: SEVERITY_COLORS.critical },
          { name: 'Errors', value: stats.error, color: SEVERITY_COLORS.error },
          { name: 'Warnings', value: stats.warning, color: SEVERITY_COLORS.warning },
          { name: 'Info', value: stats.info, color: SEVERITY_COLORS.info }
        ]);

        setActivityTypeData(
          Object.entries(stats.components)
            .map(([name, stats]) => ({
              name,
              ...stats
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
        );

      } catch (err) {
        console.error('Error fetching data:', err);
        const fetchError = {
          timestamp: new Date().toISOString(),
          message: `API Fetch Error: ${err.message}`,
          level: 'critical',
          location: {
            component: 'Maintenance System',
            pathname: window.location.pathname
          },
          metadata: {
            error: err.toString()
          }
        };
        processErrorData([fetchError], errorStats);
      }
    };

    fetchErrorData();
    const interval = setInterval(fetchErrorData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [timeRange]);

  const renderMachineCards = () => {
    return Object.entries(machineErrors)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([machine, stats]) => (
        <div key={machine} className="machine-card">
          <h3>{machine}</h3>
          <div className="machine-stats">
            <span className="stat critical" title="Critical">{stats.critical}</span>
            <span className="stat error" title="Errors">{stats.error}</span>
            <span className="stat warning" title="Warnings">{stats.warning}</span>
            <span className="stat info" title="Info">{stats.info}</span>
            <span className="stat total" title="Total">{stats.total}</span>
          </div>
        </div>
      ));
  };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Find the complete error object from faultTrends
    const timeKey = label;
    const errorData = faultTrends.find(error => {
      const errorTime = error.timestamp ? new Date(error.timestamp) : new Date();
      const minutes = errorTime.getMinutes();
      const fiveMinInterval = Math.floor(minutes / 5) * 5;
      const errorTimeKey = `${errorTime.getHours()}:${String(fiveMinInterval).padStart(2, '0')}`;
      return errorTimeKey === timeKey;
    });

    // If we found specific error data, use that, otherwise use payload data
    const data = errorData || payload[0].payload;
    
    // Safely extract all values with proper fallbacks
    const timestamp = data?.timestamp ? new Date(data.timestamp) : null;
    const formattedTime = timestamp ? formatTime(timestamp) : 'Time not available';
    
    const source = data?.machine || 
                  data?.location?.pathname || 
                  data?.metadata?.machine || 
                  'System';
    
    const component = data?.component || 
                     data?.location?.pathname || 
                     'Not specified';
    
    const user = data?.user?.username || 
                 data?.username || 
                 'Anonymous';
    
    const message = data?.message || 
                   data?.shortMessage || 
                   'No message available';
    
    const stack = data?.stack || 
                 data?.error?.stack || 
                 null;
    
    const severity = data?.severity || {
      level: data?.level || 'unknown',
      color: data?.color || '#999'
    };

    return (
      <div className="custom-tooltip" style={{ 
        background: 'var(--bg-tertiary)', 
        padding: '10px', 
        borderRadius: '4px',
        maxWidth: '400px',
        boxShadow: '0 4px 8px var(--shadow-secondary)'
      }}>
        <p style={{ 
          fontWeight: 'bold', 
          marginBottom: '8px',
          color: severity.color
        }}>
          {formattedTime} - {severity.level.toUpperCase()}
        </p>
        <div style={{ marginBottom: '6px' }}>
          <strong>Source:</strong> {source}
        </div>
        <div style={{ marginBottom: '6px' }}>
          <strong>Component:</strong> {component}
        </div>
        <div style={{ marginBottom: '6px' }}>
          <strong>User:</strong> {user}
        </div>
        <div style={{ marginBottom: '6px' }}>
          <strong>Message:</strong> {message}
        </div>
        {stack && (
          <details style={{ marginTop: '8px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              color: '#69c0ff',
              fontWeight: '500'
            }}>
              Stack Trace
            </summary>
            <pre style={{ 
              background: '#222', 
              padding: '8px', 
              borderRadius: '4px', 
              overflowX: 'auto',
              maxWidth: '100%',
              maxHeight: '200px',
              marginTop: '6px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}>
              {stack}
            </pre>
          </details>
        )}
      </div>
    );
  }
  return null;
};

const TimeSeriesLineChart = () => {
    const now = new Date();
    const fullTimeSeriesData = [...timeSeriesData];
    
    if (timeSeriesData.length === 0 || 
        new Date(timeSeriesData[0].timestamp) > START_TIME) {
      fullTimeSeriesData.unshift({
        time: `${START_TIME.getHours()}:${String(START_TIME.getMinutes()).padStart(2, '0')}`,
        timestamp: START_TIME.toISOString(),
        total: 0,
        critical: 0,
        error: 0,
        warning: 0,
        info: 0
      });
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={fullTimeSeriesData}>
          <CartesianGrid strokeOpacity={0.3}/>
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time (5-minute intervals)', position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis 
            label={{ value: 'Error Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            formatter={(value, name) => [`${value} errors`, name]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="critical"
            stroke={SEVERITY_COLORS.critical}
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{ r: 2 }}
            name="Critical"
          />
          <Line
            type="monotone"
            dataKey="error"
            stroke={SEVERITY_COLORS.error}
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{ r: 2 }}
            name="Errors"
          />
          <Line
            type="monotone"
            dataKey="warning"
            stroke={SEVERITY_COLORS.warning}
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{ r: 2 }}
            name="Warnings"
          />
          <Line
            type="monotone"
            dataKey="info"
            stroke={SEVERITY_COLORS.info}
            strokeWidth={2}
            dot={{ r: 1 }}
            activeDot={{ r: 2 }}
            name="Info"
          />
        </LineChart>
      </ResponsiveContainer>
    );
};

const TrendVisualization = () => {
  const groupDataByTimeRange = (data, range) => {
    const grouped = {};
    const now = new Date();
    let currentTime = new Date(START_TIME);
    
    // Initialize all time slots from START_TIME to now
    while (currentTime <= now) {
      let timeKey;
      let timestamp;
      
      switch(range) {
        case 'minutes':
          const minutes = currentTime.getMinutes();
          const fiveMinInterval = Math.floor(minutes / 5) * 5;
          timeKey = `${currentTime.getHours()}:${String(fiveMinInterval).padStart(2, '0')}`;
          timestamp = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate(),
            currentTime.getHours(),
            fiveMinInterval
          );
          break;
        case 'hours':
          timeKey = `${currentTime.getHours()}h`;
          timestamp = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate(),
            currentTime.getHours()
          );
          break;
        case 'days':
          timeKey = currentTime.toLocaleDateString('en-US', { weekday: 'short' });
          timestamp = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate()
          );
          break;
        case 'weeks':
          const weekNum = Math.ceil(currentTime.getDate() / 7);
          timeKey = `Week ${weekNum}`;
          timestamp = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth(),
            (weekNum - 1) * 7 + 1
          );
          break;
        default:
          timeKey = currentTime.toLocaleTimeString();
          timestamp = new Date(currentTime);
      }
      
      if (!grouped[timeKey]) {
        grouped[timeKey] = {
          timestamp: timestamp.toISOString(),
          timeKey,
          critical: 0,
          error: 0,
          warning: 0,
          info: 0
        };
      }
      
      // Increment time based on range
      switch(range) {
        case 'minutes':
          currentTime = new Date(currentTime.getTime() + 5 * 60 * 1000);
          break;
        case 'hours':
          currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
          break;
        case 'days':
          currentTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'weeks':
          currentTime = new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
      }
    }

    // Now populate with actual data
    data.forEach(item => {
      const date = item.timestamp ? new Date(item.timestamp) : new Date();
      let timeKey;
      
      switch(range) {
        case 'minutes':
          const minutes = date.getMinutes();
          const fiveMinInterval = Math.floor(minutes / 5) * 5;
          timeKey = `${date.getHours()}:${String(fiveMinInterval).padStart(2, '0')}`;
          break;
        case 'hours':
          timeKey = `${date.getHours()}h`;
          break;
        case 'days':
          timeKey = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'weeks':
          timeKey = `Week ${Math.ceil(date.getDate() / 7)}`;
          break;
        default:
          timeKey = date.toLocaleTimeString();
      }
      
      if (grouped[timeKey]) {
        const level = item.severity?.level || item.level || 'info';
        grouped[timeKey][level]++;
      }
    });
    
    return Object.values(grouped).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const groupedData = groupDataByTimeRange(faultTrends, timeRange);

  return (
    <div className="trend-visualization">
      <h2>Error Trend Over Time</h2>
      <div className="time-range-selector">
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="minutes">5-Minute Intervals</option>
          <option value="hours">Hourly</option>
          <option value="days">Daily</option>
          <option value="weeks">Weekly</option>
        </select>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart 
            data={groupedData} 
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
          >
            <CartesianGrid strokeOpacity={0.3} />
            <XAxis 
              dataKey="timeKey"
              label={{ 
                value: `Time (${timeRange})`, 
                position: 'insideBottomRight', 
                offset: -20 
              }}
            />
            <YAxis 
              label={{ 
                value: 'Error Count', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              formatter={(value, name) => [`${value} errors`, name]}
              labelFormatter={(label) => {
                const dataPoint = groupedData.find(d => d.timeKey === label);
                return dataPoint?.timestamp 
                  ? new Date(dataPoint.timestamp).toLocaleString()
                  : label;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="critical"
              stroke={SEVERITY_COLORS.critical}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 3 }}
              name="Critical"
            />
            <Line
              type="monotone"
              dataKey="error"
              stroke={SEVERITY_COLORS.error}
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 2 }}
              name="Errors"
            />
            <Line
              type="monotone"
              dataKey="warning"
              stroke={SEVERITY_COLORS.warning}
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 2 }}
              name="Warnings"
            />
            <Line
              type="monotone"
              dataKey="info"
              stroke={SEVERITY_COLORS.info}
              strokeWidth={2}
              dot={{ r: 1 }}
              activeDot={{ r: 2 }}
              name="Info"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

//console.log(statusData);

return (
  <div className='maintenance-page dark-theme'>
    <header>
      <h1>System Maintenance Dashboard</h1>
      <div className="controls">
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-selector"
        >
          <option value="minutes">5-Minute Intervals</option>
          <option value="hours">Hourly</option>
          <option value="days">Daily</option>
          <option value="weeks">Weekly</option>
        </select>
        <span onClick={()=> navigate('/profile')}>Profile</span>
        <span onClick={()=> navigate('/profile', {state: {activeTab: 'settings'}})}>Settings</span>
        <button onClick={logout} className='logout-btn'>
          Logout
        </button>
      </div>
    </header>

    <div className="dashboard">
      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card critical">
          <h3>Critical</h3>
          <div className="value">{errorStats.critical}</div>
          <div className="trend-indicator">
            {errorStats.critical > 0 ? '↑' : '→'}
          </div>
        </div>
        <div className="stat-card error">
          <h3>Errors</h3>
          <div className="value">{errorStats.error}</div>
          <div className="trend-indicator">
            {errorStats.error > 0 ? '↑' : '→'}
          </div>
        </div>
        <div className="stat-card warning">
          <h3>Warnings</h3>
          <div className="value">{errorStats.warning}</div>
          <div className="trend-indicator">
            {errorStats.warning > 0 ? '↑' : '→'}
          </div>
        </div>
        <div className="stat-card total">
          <h3>Total Events</h3>
          <div className="value">{errorStats.total}</div>
          <div className="subtext">Since {START_TIME.toLocaleDateString()}</div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="time-series-chart">
        <h2>Error Frequency From {START_TIME.toLocaleDateString()}</h2>
        <TimeSeriesLineChart />
      </div>

      {/* Machine Status */}
      <div className="machine-status">
        <h2>Error Sources</h2>
        <div className="machine-cards">
          {renderMachineCards()}
        </div>
      </div>

      {/* Trend Visualization */}
      <div className="trend-visualization">
        <h2>Error Trend Analysis</h2>
        <div className="time-range-tabs">
          <button 
            className={timeRange === 'minutes' ? 'active' : ''}
            onClick={() => setTimeRange('minutes')}
          >
            5-Min
          </button>
          <button 
            className={timeRange === 'hours' ? 'active' : ''}
            onClick={() => setTimeRange('hours')}
          >
            Hourly
          </button>
          <button 
            className={timeRange === 'days' ? 'active' : ''}
            onClick={() => setTimeRange('days')}
          >
            Daily
          </button>
          <button 
            className={timeRange === 'weeks' ? 'active' : ''}
            onClick={() => setTimeRange('weeks')}
          >
            Weekly
          </button>
        </div>
        <div className="chart-container">
          <TrendVisualization />
        </div>
      </div>

      {/* Error Breakdown */}
      <div className="error-breakdown">
        <div className="severity-breakdown">
          <h3>Error Severity Distribution</h3>
          {statusData && statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData.filter(item => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#1f1f1f"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    value, 
                    `${name}: ${(props.payload.percent * 100).toFixed(2)}%`
                  ]}
                  contentStyle={{
                    background: '#1f1f1f',
                    borderColor: '#333',
                    borderRadius: '4px'
                  }}
                />
                <Legend 
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              No severity data available
            </div>
          )}
        </div>
      </div>

        <div className="component-activity">
          <h3>Top Components with Errors</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={activityTypeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  background: '#1f1f1f',
                  borderColor: '#333'
                }}
              />
              <Bar 
                dataKey="critical" 
                stackId="a" 
                fill={SEVERITY_COLORS.critical} 
                name="Critical"
                width={50}
              />
              <Bar 
                dataKey="error" 
                stackId="a" 
                fill={SEVERITY_COLORS.error} 
                name="Errors"
                width={50}
              />
              <Bar 
                dataKey="warning" 
                stackId="a" 
                fill={SEVERITY_COLORS.warning} 
                name="Warnings"
                width={50}
              />
              <Bar 
                dataKey="info" 
                stackId="a" 
                fill={SEVERITY_COLORS.info} 
                name="Info"
                width={50}
              />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ToastContainer />
      </div>
    </div>
);
}