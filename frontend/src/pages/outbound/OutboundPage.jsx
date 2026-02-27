import { useEffect, useState } from "react";

export default function OutboundPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/outbound")
      .then(res => res.json())
      .then(data => {
        const items =
          data?.items ||
          data?.data?.items ||
          data?.data ||
          [];
        setOrders(items);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Outbound Orders</h1>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Tenant</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.status}</td>
              <td>{order.tenantId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}