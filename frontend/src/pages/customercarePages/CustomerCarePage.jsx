import { useEffect, useState, useCallback, useMemo } from "react";
import ToggleButton from '../components/buttons/toggleBtn/ToggleButton';
import CarouselSlider from "./components/Slider/Slider";
import './customer.scss';
import ReusableDropdown from "./components/Dropdown/Dropdown";
import Receipt from "./components/sections/receipt";
import { useAuth } from '../../modules/Store/AuthContext';
import { useNavigate } from 'react-router-dom';
import useOrders from './modules/useOrder';
import { FiPhone, FiPackage, FiCreditCard, FiUser, FiCalendar as FiCal, FiCalendar, FiChevronDown, FiChevronUp  } from 'react-icons/fi';
import { toast } from "../../modules/Store/ToastStore";
// import { CouponCard } from "./components/Cards/couponcard";
import axios from 'axios';

const statuses = [
  'pending delivery',
  'dispatched',
  'in delivery',
  'dismissed',
  'awaiting pickup',
  'arrived at destination',
  'complete',
  'rejected',
  'approved'
];

// const offerOptions = [
//   '10% off',
//   'Free delivery',
//   'Buy 1 Get 1',
//   'Ksh 500 off'
// ];

export default function CustomerCarePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { orders, error } = useOrders();
  const [isExpanded, setIsExpanded] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [autoApprovalPaused, setAutoApprovalPaused] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(statuses[0]);
  const [selected, setSelected] = useState(null);
  const [triggerPrint, setTriggerPrint] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [focusedUser, setFocusedUser] = useState(null);
  // const [username, setUsername] = useState('');
  // const [expiry, setExpiry] = useState('');
  // const [selectedOffer, setSelectedOffer] = useState('');
  // const [coupondata, setCouponData] = useState([]);

  const ordersArray = orders.orders || []; 
  const groupedOrders = ordersArray.reduce((acc, order) => {
    if (!order?.username) {
      console.warn('Order missing username:', order);
      return acc;
    }
    acc[order.username] = acc[order.username] || [];
    acc[order.username].push(order);
    return acc;
  }, {});

  const capitalize = useCallback((status) => {
    if (!status) return '';
    const match = statuses.find(s => s.toLowerCase() === status.toLowerCase());
    return match || status;
  }, [statuses]);

  const sortedOrders = useMemo(() => {
    const ordersArray = orders.orders || [];
    return [...ordersArray].sort((a, b) => {
      const indexA = statuses.indexOf(capitalize(a.status));
      const indexB = statuses.indexOf(capitalize(b.status));
      return indexA - indexB;
    });
  }, [orders, statuses, capitalize]);

  useEffect(() => {
    setOrderList(sortedOrders);
  }, [sortedOrders]);

  useEffect(() => {
    if (activeTab !== 'customers') {
      setFocusedUser(null);
    }
  }, [activeTab]);

  const rotateNext = () => {
    if (orderList?.length === 0) return;
    const newList = [...orderList];
    newList.push(newList.shift());
    setOrderList(newList);
  };

  const rotatePrev = () => {
    if (orderList?.length === 0) return;
    const newList = [...orderList];
    newList.unshift(newList.pop());
    setOrderList(newList);
  };

  const focusCard = (index) => {
    if (index === 0 || index >= orderList?.length) return;
    const newList = [...orderList];
    const focused = newList.splice(index, 1)[0];
    newList.unshift(focused);
    setOrderList(newList);
    setSelectedStatus(capitalize(focused.status));
  };

const updateOrderStatus = async (newStatus) => {
  if (!orderList || orderList.length === 0 || !focusedOrder) return;
  
  try {
    const orderId = focusedOrder._id;
    await axios.put(`http://localhost:5000/api/buy/update-status/${orderId}`, {
      status: newStatus}, {
      withCredentials: true, 
    });
    
    setOrderList(prev => prev.map((order, idx) => 
      idx === 0 ? { ...order, status: newStatus } : order
    ));
    
    setSelected(capitalize(newStatus));
    
    toast.success(`Status updated to ${capitalize(newStatus)}`);
  } catch (error) {
    console.error('Status update failed:', error);
    toast.error(error.response?.data?.message || 'Failed to update status');
    setSelected(capitalize(focusedOrder.status));
  }
};
  const focusedOrder = orderList[0] || null;

  useEffect(() => {
    if (focusedOrder) {
      setSelected(capitalize(focusedOrder.status));
    } else {
      setSelected(null);
    }
  }, [focusedOrder]);

  const handleAutoApprove = () => {
    if (autoApprovalPaused || orderList.length === 0) return;

    const updatedOrders = orderList.map(order => {
      const status = order.status?.toLowerCase();
      if (status !== 'complete' && status !== 'rejected') {
        return { 
          ...order, 
          status: order.paymentDetails?.details?.t_id ? "Approved" : "Pending delivery" 
        };
      }
      return order;
    });

    setOrderList(updatedOrders);
    if (updatedOrders[0]) {
      const newStatus = capitalize(updatedOrders[0].status);
      setSelectedStatus(newStatus);
      setSelected(newStatus);
    }
  };

  const handlePauseAutoApprove = () => {
    setAutoApprovalPaused(true);
    console.log("Auto approval paused.");

    if (orderList.length > 0) {
      const currentFocused = orderList[0];
      setSelectedStatus(capitalize(currentFocused.status));
      setSelected(capitalize(currentFocused.status));
    }
  };

  const handleResumeAutoApprove = () => {
    setAutoApprovalPaused(false);
    console.log("Auto approval resumed.");
  };

  // Commented out coupon submission handler
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!focusedUser || !selectedOffer) {
  //     alert("Please select a customer and an offer.");
  //     return;
  //   }

  //   try {
  //     const res = await fetch(
  //       `http://localhost:5000/api/coupons/award-coupon/${focusedUser}`,
  //       {
  //         method: 'POST',
  //         credentials: 'include',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({
  //           offer: selectedOffer,
  //           expires: expiry ? new Date(expiry) : new Date()
  //         })
  //       }
  //     );

  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData.message || 'Failed to award coupon');
  //     }

  //     const data = await res.json();
  //     console.log('Generated coupon:', data);
  //     toast.success(`Coupon for ${focusedUser} generated!`); 
  //     setSelectedOffer('');
  //     setExpiry('');
  //     setCouponData(prev => [...prev, data.coupon]);
  //   } catch (err) {
  //     console.error('Coupon generation failed:', err);
  //     toast.error(err.message || 'Failed to generate coupon.');
  //   }
  // };

  // useEffect(() => {
  //   if (focusedUser) {
  //     setUsername(focusedUser);
  //   }
  // }, [focusedUser]);

  // Commented out coupon fetching logic
  // useEffect(() => {
  //   if (!username) return; 

  //   const abortController = new AbortController();
    
  //   const fetchCoupons = async () => {
  //     try {
  //       const res = await fetch(
  //         `http://localhost:5000/api/coupons/get-coupons/${username}`, 
  //         {
  //           credentials: "include",
  //           headers: { 'Content-Type': 'application/json' },
  //           signal: abortController.signal
  //         }
  //       );

  //       if (!res.ok) {
  //         throw new Error("Failed to fetch coupons");
  //       }

  //       const data = await res.json();
  //       if (data?.coupons) {
  //         setCouponData(data.coupons);
  //       }
  //     } catch (e) {
  //       if (e.name !== 'AbortError') {
  //         console.error("Coupon fetch error:", e);
  //         toast.error("Failed to get coupon data");
  //       }
  //     }
  //   };

  //   fetchCoupons();
    
  //   return () => abortController.abort();
  // }, [username]);

  const s = capitalize(focusedOrder?.status)

  return (
    <div className="customer-care-page">
      <header>
        <h1>Customer Care</h1>
        <div>
          <span
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab('orders')}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab('orders')}
            className={activeTab === 'orders' ? 'active-tab' : ''}
            style={{ cursor: 'pointer', margin: '0 10px' }}
          >
            Orders
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => setActiveTab('customers')}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab('customers')}
            className={activeTab === 'customers' ? 'active-tab' : ''}
            style={{ cursor: 'pointer', margin: '0 10px' }}
          >
            Customers
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/profile')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/profile')}
            style={{ cursor: 'pointer', margin: '0 10px' }}
          >
            Profile
          </span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error loading orders: {error}
        </div>
      )}

      {activeTab === 'orders' && (
        <>
          <section>
            <h2>Orders</h2>
            <CarouselSlider
              orderList={orderList}
              rotateNext={rotateNext}
              rotatePrev={rotatePrev}
              focusCard={focusCard}
            />
            <div className="autoBtns">
              <button className="auto-approve-btn" onClick={handleAutoApprove}>Auto approve</button> |
              <button
                className="pause-btn"
                onClick={() => {
                  autoApprovalPaused ? handleResumeAutoApprove() : handlePauseAutoApprove();
                }}
              >
                {autoApprovalPaused ? "Resume" : "Pause"}
              </button>
            </div>
          </section>

          <section className="detailContainer">
            <div>
              <h3><strong>Details</strong></h3>
              <div className="details">
                {focusedOrder ? (
                  <>
                    <p><strong>Contact: </strong>{focusedOrder.contact || 'N/A'}</p>
                    <p><strong>Coordinates:</strong> {Array.isArray(focusedOrder.coordinates) ? `${focusedOrder.coordinates[0].street} - ${focusedOrder.coordinates[0].town}, ${focusedOrder.coordinates[0].county}` : 'N/A'}</p>
                    <p><strong>Items:</strong></p>
                    <table>
                      <thead>
                        <tr className="table-title" style={{ color: "black", backgroundColor: 'white' }}>
                          <th style={{ color: "black" }}>Device</th>
                          <th style={{ color: "black" }}>Price (Ksh)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(focusedOrder.items?.devices) && focusedOrder.items.devices.length > 0 ? (
                          focusedOrder.items.devices.map((device, idx) => (
                            <tr key={idx}>
                              <td>{device.name || 'N/A'}</td>
                              <td>{device.price?.toLocaleString() || 'N/A'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2}>No devices found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <p><strong>Expected delivery time: </strong>
                    2-5 hours
                    </p>
                    <p><strong>Status: </strong> {s}</p>
                    <p><strong>Order ID:</strong> {focusedOrder.orderId || 'N/A'}</p>
                    <p><strong>Username:</strong> {focusedOrder.username || 'N/A'}</p>
                  </>
                ) : (
                  <p>Click on order to view details</p>
                )}
              </div>

              <div className="actions">
                <h4>Status</h4>
                <ReusableDropdown
                  data={statuses}
                  value={focusedOrder?.status || ''} 
                  onChange={(newStatus) => {
                    updateOrderStatus(newStatus);
                  }}
                  getLabel={capitalize} 
                  getKey={(item) => item} 
                />
              </div>
            </div>
            <div>
              <Receipt order={focusedOrder} triggerPrint={triggerPrint} />
              <button className="generateRptBtn" onClick={() => {
                setTriggerPrint(true);
                setTimeout(() => setTriggerPrint(false), 1000);
              }}>Print Receipt</button>
            </div>
          </section>
        </>
      )}

      {activeTab === 'customers' && (
        <>
          <section className="customer-section">
            <h2>Customers</h2>

            {focusedUser && (
              <div className="user-orders-dark">
                <h3 className="dark-heading">Orders for <span className="username-highlight">{focusedUser}</span></h3>
                <div className="orders-grid-dark">
                  {groupedOrders[focusedUser]?.map(order => (
                    <div key={order.orderId} className="order-card-dark">
                      <div className="card-header-dark">
                        <span className="order-id-dark">#{order.orderId}</span>
                        <span className={`status-pill-dark ${order.status.replace(/\s+/g, '-')}`}>
                          {capitalize(order.status)}
                        </span>
                      </div>
                      
                      <div className="card-body-dark">
                        <div className="info-row-dark">
                          <FiPhone className="info-icon-dark" />
                          <span>{order.contact || 'Not provided'}</span>
                        </div>
                        
                        <div className="info-row-dark">
                          <FiCalendar className="info-icon-dark" />
                          <span>{new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        
                        <div className="items-section-dark">
                          <FiPackage className="info-icon-dark" />
                          <div className="items-grid-dark">
                            {order.items?.devices?.map((device, i) => (
                              <span key={i} className="item-chip-dark">
                                {device.name || `Item ${i+1}`}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="payment-row-dark">
                          <div className="payment-method-dark">
                            <FiCreditCard className="info-icon-dark" />
                            <span>{order.paymentDetails?.method ? capitalize(order.paymentDetails.method) : 'N/A'}</span>
                          </div>
                          <div className="total-amount-dark">
                            Ksh {order.items?.totalPrice?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Commented out coupon form section */}
                {/* <section className={`coupon-form-section ${isExpanded ? 'expanded' : ''}`}>
                  <div 
                    className="form-header"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <h3>
                      <span className="coupon-icon">🎟️</span>
                      Generate Coupon
                    </h3>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>

                  {isExpanded && (
                    <form onSubmit={handleSubmit}>
                      <label>
                        <span><FiUser className="form-icon" /> Username:</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                          required
                        />
                      </label>

                      <label>
                        <span><FiGift className="form-icon" /> Select Offer:</span>
                        <select
                          value={selectedOffer}
                          onChange={(e) => setSelectedOffer(e.target.value)}
                          required
                        >
                          <option value="" disabled>Select an offer</option>
                          {offerOptions.map(offer => (
                            <option key={offer} value={offer}>{offer}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span><FiCal className="form-icon" /> Expiry Date:</span>
                        <input
                          type="date"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                        />
                      </label>

                      <button type="submit">
                        <FiPlusCircle />
                        Generate Coupon
                      </button>
                    </form>
                  )}
                </section> */}

                {/* Commented out coupon display section */}
                {/* {coupondata && coupondata.length > 0 && (
                  <div className="coupon-section">
                    <h4>Coupons Awarded</h4>
                    {coupondata.map((coupon, idx) => (
                      !coupon.used && <CouponCard key={idx} coupon={coupon} />
                    ))}
                  </div>
                )} */}

              </div>
            )}

            <div className="orders-table-container">
              {Object.keys(groupedOrders).length === 0 ? (
                <div className="no-orders">No orders found.</div>
              ) : (
                <table className="customer-table order-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedOrders).map(([user, userOrders]) => (
                      userOrders.map(order => (
                        <tr 
                          key={order.orderId}
                          className={focusedUser === user ? 'focused-row' : ''}
                          onClick={() => setFocusedUser(user)}
                        >
                          <td>{user}</td>
                          <td>{order.contact || 'N/A'}</td>
                          <td>{order.orderId}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            {order.items?.devices?.length > 0 ? (
                              <ul className="items-list">
                                {order.items.devices.map((device, i) => (
                                  <li key={i}>{device.name || `Device ${i+1}`}</li>
                                ))}
                              </ul>
                            ) : 'No items'}
                          </td>
                          <td>{order.items?.totalPrice ? `Ksh ${order.items.totalPrice.toLocaleString()}` : 'N/A'}</td>
                          <td>
                              {order.status}
                          </td>
                          <td>{order.paymentDetails?.method || 'N/A'}</td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}