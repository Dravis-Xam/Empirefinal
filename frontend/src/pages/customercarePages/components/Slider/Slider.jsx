import './CarouselSlider.css';

export default function CarouselSlider({ orderList = [], rotateNext, rotatePrev, focusCard }) {
  const getCardClass = (idx) => {
    if (idx === 0) return 'active';
    if (idx === 1) return 'next';
    if (idx === orderList.length - 1) return 'prev';
    return 'hidden';
  };

  return (
    <div className='orderContainer01'>
      <div className="carousel-container">
        <div className="carousel-blur blur-left" />
        <div className="carousel">
          <button onClick={rotatePrev} className="nav-button" hidden = {orderList.length < 2}>‹</button>

          <div className="carousel-track">
            {orderList.map((order, idx) => (
              <div
                key={order.orderId}
                className={`carousel-card ${getCardClass(idx)}`}
                style={{ transform: idx === 0 ? 'scale(1.1)' : 'scale(0.9)' }}
              >
                <span className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z\-]/g, '')}`}>
                  {order.status}
                </span>
                <h3>{order.orderId}</h3>
                <p>{order.username}</p>
                <p className="devices-text" style={{overflow: 'ellipsis'}}>
                  {
                    order?.items?.devices?.length > 2
                      ? order.items.devices.slice(0, 2).map(device => device.name || device.model || 'Device').join(', ') + ', ...'
                      : order?.items?.devices?.map(device => device.name || device.model || 'Device').join(', ')
                  }
                </p>
                <p>{order.paymentDetails.details.currency} {order.paymentDetails.details.pay}</p>
              </div>
            ))}
          </div>

          <button onClick={rotateNext} className="nav-button" hidden = {orderList.length < 2}>›</button>
        </div>
        <div className="carousel-blur blur-right" />
      </div>

      <div className="cardList">
        {orderList.slice(0, 5).map((order) => {
          const realIndex = orderList.findIndex(o => o.orderId === order.orderId);
          return (
            <div
              className="list-card"
              key={`list-${order.orderId}`}
              onClick={() => focusCard(realIndex)}
            >
              <div className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z\-]/g, '')}`}>
                {order.status}
              </div>
              <div className="list-info">
                <p className="list-id">{order.orderId}</p>
                <p className="list-user">{order.username}</p>
                <p className="list-amount">
                  {order.paymentDetails.details.currency} {order.paymentDetails.details.pay}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}