
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getOrderById } from "../api/orderApi.js";

const OrderDetails = () => {
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getOrderById(orderId);

                setOrder(data.order);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to fetch order details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return <p>Loading order details...</p>;
    }

    if (error) {
        return (
            <div className="order-details-page">
                <p>{error}</p>
                <Link to="/orders">Back to Orders</Link>
            </div>
        );
    }

    if (!order) {
        return <p>Order details not found.</p>;
    }

    return (
        <div className="order-details-page">
            <Link to="/orders">← Back to Orders</Link>

            <h1>Order Details</h1>

            <p>
                <strong>Order ID:</strong> {order._id}
            </p>

            <p>
                <strong>Status:</strong> {order.orderStatus}
            </p>

            <h2>
                {order.restaurant?.name || "Restaurant"}
            </h2>

            <h3>Items</h3>

            {order.items?.map((item, index) => (
                <div
                    key={item._id || `${item.menuItem}-${index}`}
                    className="order-detail-item"
                >
                    <span>{item.name}</span>
                    <span>
                        ₹{item.price} × {item.quantity}
                    </span>
                    <span>
                        ₹{item.price * item.quantity}
                    </span>
                </div>
            ))}

            <h3>Bill Summary</h3>

            <p>
                Subtotal: ₹{order.subtotal}
            </p>

            <p>
                Delivery fee: ₹{order.deliveryFee}
            </p>

            <p>
                Discount: ₹{order.discount}
            </p>

            <h3>
                Total: ₹{order.totalAmount}
            </h3>

            <h3>Delivery Address</h3>
            <p>{order.deliveryAddress}</p>

            <h3>Payment</h3>
            <p>
                Method: {order.paymentMethod}
            </p>
            <p>
                Status: {order.paymentStatus}
            </p>
        </div>
    );
};

export default OrderDetails;