export default function StatCard({ title, value, note, color, icon }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-header">
        <span className="icon">{icon}</span>
        <h5>{title}</h5>
      </div>
      <p className="stat-value">{value}</p>
      <small className="stat-note">{note}</small>
    </div>
  );
}
