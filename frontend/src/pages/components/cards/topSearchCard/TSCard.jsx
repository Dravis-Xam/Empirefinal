import React from "react";
import './TSCard.css';

import './TSCard.css';

export default function TopSearchCard({ t, onClick }) {
  return (
    <div className="topSearchCard" onClick={onClick}>
      {t}
    </div>
  );
}
