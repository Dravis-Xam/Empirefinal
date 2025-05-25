import React from "react";
import './DirectoryNav.css';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../../../../modules/Store/AuthContext";

export default function DirectoryNavigation() {
  const location = useLocation();
  const { user } = useAuth();

  const pathMap = {
    "/": "  ",
    "/profile": "Profile",
    "/login": "Login",
    "/signup": "Sign up",
    "/passwordRecovery": "Password Recovery",
    "/cart": "Cart",
    "/search": "Search Page",
    "/details": "Detail Page",
    "/checkout": "Payment & Delivery",
    "/about-us": "About Us",
    "/contact-us": "Contact Us",
    "/track-delivery": "Track your delivery",
    "/maintenance":"Maintenance",
    "/customer-care":"Customer care",
    "/inventory":"Inventory management",
  };

  const currentPathName = pathMap[location.pathname] || "Unknown Page";

  return (
    <div className="directory-nav">
      <small>
        { user?.role === 'customer care' &&
        <><Link to="/customer-care">Home</Link> &gt; {currentPathName}</>
        }
        { user?.role === 'inventory manager' &&
        <><Link to="/inventory">Home</Link> &gt; {currentPathName}</>
        }
        { user?.role === 'developer' &&
        <><Link to="/maintenance">Home</Link> &gt; {currentPathName}</>
        }
        { (user?.role === '' || user?.role === 'client' || user?.role === null) &&
        <><Link to="/">Home</Link> &gt; {currentPathName}</>
        }
      </small>
    </div>
  );
}
