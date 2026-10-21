import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Check,
    Crown,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import AdminLayout from "../../components/Layout/AdminLayout";

interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayFailureResponse {
    error?: {
        description?: string;
        reason?: string;
    };
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpaySuccessResponse) => void;
    modal: {
        ondismiss: () => void;
    };
    theme: {
        color: string;
    };
}

interface RazorpayInstance {
    open: () => void;
    on: (
        event: "payment.failed",
        callback: (response: RazorpayFailureResponse) => void
    ) => void;
}

interface OrderResponse {
    success: boolean;
    message?: string;
    data?: {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    };
}

interface VerifyResponse {
    success: boolean;
    message?: string;
}

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

export default function PremiumPayment() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handlePayment = async () => {
        if (loading) return;

        setLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setMessage("Please log in before purchasing Premium.");
                setLoading(false);
                return;
            }

            if (!window.Razorpay) {
                setMessage(
                    "Razorpay Checkout could not load. Refresh the page and try again."
                );
                setLoading(false);
                return;
            }

            const orderResponse = await fetch(
                "http://localhost:5000/api/payments/create-order",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const contentType = orderResponse.headers.get("content-type");
            let orderResult: OrderResponse;

            if (contentType && contentType.includes("application/json")) {
                orderResult = await orderResponse.json();
            } else {
                throw new Error(
                    `API routing error (${orderResponse.status} ${orderResponse.statusText}): Server returned HTML instead of JSON. Ensure the backend server is running and /api/payments is mounted.`
                );
            }

            if (!orderResponse.ok || !orderResult.success || !orderResult.data) {
                throw new Error(
                    orderResult.message || "Could not create the payment order."
                );
            }

            const order = orderResult.data;
            const checkoutAmount =
                order.amount < 1000 ? Math.round(order.amount * 100) : order.amount;

            const checkout = new window.Razorpay({
                key: order.keyId,
                amount: checkoutAmount,
                currency: order.currency,
                name: "Headless CMS",
                description: "Premium Plan - 30 days",
                order_id: order.orderId,

                handler: async (response: RazorpaySuccessResponse) => {
                    try {
                        const verifyResponse = await fetch(
                            "http://localhost:5000/api/payments/verify",
                            {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            }
                        );

                        const verifyContentType =
                            verifyResponse.headers.get("content-type");
                        let verifyResult: VerifyResponse;

                        if (
                            verifyContentType &&
                            verifyContentType.includes("application/json")
                        ) {
                            verifyResult = await verifyResponse.json();
                        } else {
                            throw new Error(
                                `Payment verification error (${verifyResponse.status} ${verifyResponse.statusText}): Server did not return JSON. If you were charged, please contact support.`
                            );
                        }

                        if (!verifyResponse.ok || !verifyResult.success) {
                            setMessage(
                                verifyResult.message ||
                                "Payment verification failed. If you were charged, contact support."
                            );
                            return;
                        }

                        setMessage(
                            "Payment verified successfully! Your Premium plan is now active."
                        );
                    } catch (verifyErr) {
                        setMessage(
                            verifyErr instanceof Error
                                ? verifyErr.message
                                : "Could not verify the payment. If you were charged, contact support before trying again."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    },
                },

                theme: {
                    color: "#111827",
                },
            });

            checkout.on("payment.failed", (response) => {
                setMessage(
                    response.error?.description ||
                    "Payment failed. Please try again."
                );
                setLoading(false);
            });

            checkout.open();
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    padding: "32px 24px",
                }}
            >
                <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        marginBottom: "28px",
                    }}
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <Crown size={42} />
                    <h1>Upgrade to Premium</h1>
                    <p>
                        Unlock premium themes and create more websites for your business.
                    </p>
                </div>

                <div
                    style={{
                        maxWidth: "520px",
                        margin: "0 auto",
                        padding: "32px",
                        border: "1px solid #E2E8F0",
                        borderRadius: "20px",
                        background: "#FFFFFF",
                        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <Sparkles size={24} />
                        <h2 style={{ margin: 0 }}>Premium Plan</h2>
                    </div>

                    <p style={{ color: "#64748B", lineHeight: 1.7 }}>
                        Get access to exclusive website templates and premium CMS features.
                    </p>

                    <div style={{ margin: "24px 0" }}>
                        <span style={{ fontSize: "42px", fontWeight: 700 }}>₹399</span>
                        <span style={{ color: "#64748B" }}> / 30 days</span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        {[
                            "Access to Premium website themes",
                            "Create more websites beyond the Free plan limit",
                            "Premium access for 30 days after verified payment",
                            "Secure payment through Razorpay",
                        ].map((feature) => (
                            <div
                                key={feature}
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "center",
                                }}
                            >
                                <Check size={18} color="#16A34A" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handlePayment}
                        disabled={loading}
                        style={{
                            width: "100%",
                            marginTop: "28px",
                            padding: "14px",
                            border: "none",
                            borderRadius: "10px",
                            background: loading ? "#64748B" : "#111827",
                            color: "#FFFFFF",
                            fontSize: "16px",
                            fontWeight: 600,
                            cursor: loading ? "wait" : "pointer",
                        }}
                    >
                        {loading ? "Processing..." : "Pay ₹399"}
                    </button>

                    {message && (
                        <p
                            role="status"
                            style={{
                                marginTop: "16px",
                                lineHeight: 1.6,
                                overflowWrap: "anywhere",
                            }}
                        >
                            {message}
                        </p>
                    )}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                            alignItems: "center",
                            marginTop: "16px",
                            color: "#64748B",
                            fontSize: "12px",
                        }}
                    >
                        <ShieldCheck size={16} />
                        Secure checkout · Manual monthly renewal
                    </div>
                </div>

                <p
                    style={{
                        textAlign: "center",
                        color: "#64748B",
                        fontSize: "13px",
                        marginTop: "24px",
                    }}
                >
                    Your subscription will not renew automatically. Pay again when your
                    Premium period expires.
                </p>
            </div>
        </AdminLayout>
    );
}
