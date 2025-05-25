import React, { useState, useEffect } from "react";
import ToggleButton from "../components/buttons/toggleBtn/ToggleButton";
import "./inventory.css";
import increaseIcon from "../../assets/icons/increase.png";
import decreaseIcon from "../../assets/icons/decrease.png";
import ReusableDropdown from "../customercarePages/components/Dropdown/Dropdown";
import DeviceModal from "./modal/deviceModal";
import { mockDevices, mockOrders } from "./mockData";
import { useAuth } from "../../modules/Store/AuthContext";

export default function InventoryPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("stocks");
  const [devices, setDevices] = useState(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterRAM, setFilterRAM] = useState("All");
  const [filterStorage, setFilterStorage] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [isAddingNewDevice, setIsAddingNewDevice] = useState(false);

  const brands = ["All", ...new Set(devices.map(d => d?.brand).filter(Boolean))];
  const rams = ["All", ...new Set(devices.map(d => d?.details?.RAM).filter(Boolean))];
  const storages = ["All", ...new Set(devices.map(d => d?.details?.storage).filter(Boolean))];

  const totalStockValue = devices.reduce((sum, d) => sum + (d?.price || 0) * (d?.amountInStock || 0), 0);
  const totalOrders = mockOrders.length;

  const filteredDevices = devices.filter(d => {
    //const detail = d?.details || {};
    return (
      (d?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d?.deviceId?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterBrand === "All" || d?.brand === filterBrand) &&
      (filterRAM === "All" || d?.details?.RAM === filterRAM) &&
      (filterStorage === "All" || d?.details?.storage === filterStorage)
    );
  });

  const filteredOrders = mockOrders.filter(order =>
    order.username.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.contact.includes(orderSearch)
  );

  useEffect(() => {
    const savedTab = localStorage.getItem("activeInventoryTab");
    if (savedTab) setActiveTab(savedTab);
  }, []);

  const fetchDevices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/inventory", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.devices) && data.devices.length > 0) {
          setDevices(data.devices);
        } else {
          setDevices(mockDevices);
        }
      } catch (error) {
        console.error("Device fetch error:", error);
        setDevices(mockDevices);
      }
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const saveUpdatedDevice = (updated) => {
    setDevices(prev =>
      prev?.map(dev =>
        dev?.deviceId === updated?.deviceId || dev?.deviceId === updated?.deviceId ? updated : dev
      )
    );
    fetchDevices();
  };

  const saveNewDevice = (device) => {
    setDevices(prev => [...prev, device]);
  };

  const switchToActiveTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeInventoryTab", tab);
  };

  return (
    <div className="inventory-page">
      <header>
        <h1>Inventory</h1>
        <span className="topLeft">
          <span>Profile</span>
          <ToggleButton
            isOnDefault={false}
            onToggle={(state) => console.log("Dark mode:", state)}
            labels={["Light", "Dark"]}
            colors={["#eee", "#333"]}
            icons={["🌞", "🌙"]}
          />
          <button className="logOutBtn" onClick={logout}>Logout</button>
        </span>
      </header>

      <section className="live-stats-container">
        {[
          { key: "stocks", title: "Current stock value", badge: "fall", icon: decreaseIcon, value: `Ksh. ${totalStockValue.toLocaleString()}` },
          { key: "orders", title: "Orders made", badge: "rise", icon: increaseIcon, value: `${totalOrders} orders` },
          { key: "expenses", title: "Total expenses", badge: "constant", icon: null, value: "Ksh. 708000" },
          { key: "income", title: "Total income", badge: "rise", icon: increaseIcon, value: "Ksh. 306800" },
        ].map(({ key, title, badge, icon, value }) => (
          <div
            key={key}
            className={`live-stat-card ${activeTab === key ? "active" : ""}`}
            onClick={() => switchToActiveTab(key)}
          >
            <h2>{title}</h2>
            <p>
              <small className={`badge ${badge}`}>
                {icon && <img src={icon} alt="..." />} <span>{badge}</span>
              </small>
              <strong>{value}</strong>
            </p>
          </div>
        ))}
      </section>

      <section className="bd--0">
        {activeTab === "stocks" && (
          <section className="stocks-container active">
            <section className="search-area">
              <h4>Stocks</h4>
              <div className="inputContainer">
                <input
                  type="text"
                  placeholder="Search Stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filters-area">
                <ReusableDropdown data={brands} value={filterBrand} onChange={setFilterBrand} getLabel={i => i} getKey={i => i} />
                <ReusableDropdown data={rams} value={filterRAM} onChange={setFilterRAM} getLabel={i => i === "All" ? "All RAM" : `${i} GB RAM`} getKey={i => i} />
                <ReusableDropdown data={storages} value={filterStorage} onChange={setFilterStorage} getLabel={i => i === "All" ? "All Storage" : `${i} GB Storage`} getKey={i => i} />
              </div>
              <button className="new-device-btn" onClick={() => setIsAddingNewDevice(true)}>Add New</button>
            </section>

            <div className="device-table">
              <table>
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Build</th>
                    <th>Price</th>
                    <th>In Stock</th>
                    <th>Featured</th>
                    <th>Storage</th>
                    <th>RAM</th>
                    <th>OS</th>
                    <th>Camera</th>
                    <th>Battery</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map(device => {
                    const detail = device.details;
                    return (
                      <tr key={device._id || device.deviceId}>
                        <td>{device.deviceId}</td>
                        <td>{device.brand}</td>
                        <td>{device.model}</td>
                        <td>{device.build || "-"}</td>
                        <td>{device.price?.toLocaleString()}</td>
                        <td>{device.amountInStock}</td>
                        <td>{device.featured ? "Yes" : "No"}</td>
                        <td>{detail.storage} GB</td>
                        <td>{detail.RAM} GB</td>
                        <td>{detail.os}</td>
                        <td>{detail.CAMResolution?.join(" / ")}</td>
                        <td>{detail.batteryLife ? `${detail.batteryLife.percentage}% - ${detail.batteryLife.hours} hrs` : "-"}</td>
                        <td><button onClick={() => setSelectedDevice(device)}>Update</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {(selectedDevice || isAddingNewDevice) && (
                <DeviceModal
                  device={selectedDevice}
                  onClose={() => {
                    setSelectedDevice(null);
                    setIsAddingNewDevice(false);
                  }}
                  onSave={isAddingNewDevice ? saveNewDevice : saveUpdatedDevice}
                />
              )}
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="orders-container active">
            <section className="search-area">
              <h4>Orders</h4>
              <div className="inputContainer">
                <input
                  type="text"
                  placeholder="Search Orders by username, ID, contact..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
            </section>
            <div className="order-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Username</th>
                    <th>Contact</th>
                    <th>Coordinates</th>
                    <th>Items</th>
                    <th>Total Price</th>
                    <th>Age</th>
                    <th>Ordered At</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.orderId}>
                      <td>{order.orderId}</td>
                      <td>{order.username}</td>
                      <td>{order.contact}</td>
                      <td>{order.coordinates?.join(", ")}</td>
                      <td>{order.items?.devices?.map((item, i) => (
                        <div key={i}>{item.name} - {item.price.toLocaleString()} Ksh</div>
                      ))}</td>
                      <td>{order.items?.totalPrice?.toLocaleString()} Ksh</td>
                      <td>{order.items?.age}</td>
                      <td>{new Date(order.orderedAt).toLocaleDateString()}</td>
                      <td>{order.status}</td>
                      <td>{order.paymentDetails?.method}</td>
                      <td>{order.paymentDetails?.details?.t_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "expenses" && <section className="expenses-container active">Expenses</section>}
        {activeTab === "income" && <section className="income-container active">Income</section>}
      </section>
    </div>
  );
}
