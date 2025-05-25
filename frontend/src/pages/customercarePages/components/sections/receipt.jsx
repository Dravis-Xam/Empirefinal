import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import './receipt.css'

export default function Receipt({ order, triggerPrint, onPrintDone }) {
  const receiptRef = useRef();
  const barcodeRef = useRef();

  useEffect(() => {
    if (order && barcodeRef.current) {
      JsBarcode(barcodeRef.current, order.orderId, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 40,
        displayValue: true,
      });
    }
  }, [order]);

  useEffect(() => {
    if (triggerPrint && order) {
      setTimeout(() => {
        handlePrint();
        onPrintDone?.();
      }, 500);
    }
  }, [triggerPrint, order]);

  const handlePrint = () => {
    const printContents = receiptRef.current.innerHTML;
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Order Receipt</title>');
    win.document.write('<style>');
    win.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .receipt { border: 1px solid #ccc; padding: 20px; border-radius: 6px; }
      h2 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
      .receipt-row { margin: 8px 0; }
      .label { font-weight: bold; }
      ul { padding-left: 20px; }
    `);
    win.document.write('</style></head><body>');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  if (!order) return <p>No order selected</p>;

  return (
    <div>
      <div ref={receiptRef} className="receipt">
        <svg ref={barcodeRef} id="barcode"></svg>

        <h2>Order Receipt</h2>
        <div className="receipt-row"><span className="label">Order ID:</span> {order.orderId}</div>
        <div className="receipt-row"><span className="label">Customer:</span> {order.username}</div>
        <div className="receipt-row"><span className="label">Ordered At:</span> {new Date(order.orderedAt).toLocaleString()}</div>
        <div className="receipt-row"><span className="label">Contact:</span> {order.contact}</div>
        <div className="receipt-row"><span className="label">Devices:</span>
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Price (Ksh)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.devices.map((device, idx) => (
                <tr key={idx}>
                  <td>{device.name}</td>
                  <td>{device.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="receipt-row"><span className="label">Total:</span> Ksh {order.items.totalPrice}</div>
        <div className="receipt-row"><span className="label">Payment:</span> {order.paymentDetails.method}</div>
        <div className="receipt-row"><span className="label">Transaction ID:</span> {order.paymentDetails.details.t_id}</div>
        {/**<button onClick={handlePrint}>🖨️ Print</button>*/}
      </div>
    </div>
  );
}