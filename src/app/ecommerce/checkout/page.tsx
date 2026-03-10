"use client";

import React, { useState, useRef, useEffect } from "react";
import { useActivity } from "@/context/ActivityContext";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    inStock: boolean;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface ShippingInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    shippingMethod: "standard" | "express" | "overnight";
}

interface PaymentInfo {
    cardName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    billingAddress: "same" | "different";
}

type Step = "products" | "cart" | "shipping" | "payment" | "confirmation";

// ─────────────────────────────────────────────────────────────────────────────
// Product Catalog
// ─────────────────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
    { id: "p1", name: "Wireless Headphones", price: 79.99, image: "headphones", category: "Electronics", rating: 4.5, inStock: true },
    { id: "p2", name: "USB-C Hub Adapter", price: 34.99, image: "adapter", category: "Electronics", rating: 4.2, inStock: true },
    { id: "p3", name: "Mechanical Keyboard", price: 129.99, image: "keyboard", category: "Electronics", rating: 4.8, inStock: true },
    { id: "p4", name: "Ergonomic Mouse", price: 49.99, image: "mouse", category: "Electronics", rating: 4.3, inStock: true },
    { id: "p5", name: "Monitor Stand", price: 39.99, image: "stand", category: "Accessories", rating: 4.0, inStock: true },
    { id: "p6", name: "Laptop Sleeve 15\"", price: 24.99, image: "sleeve", category: "Accessories", rating: 4.6, inStock: true },
    { id: "p7", name: "Webcam HD 1080p", price: 59.99, image: "webcam", category: "Electronics", rating: 4.1, inStock: false },
    { id: "p8", name: "Desk Lamp LED", price: 29.99, image: "lamp", category: "Accessories", rating: 4.4, inStock: true },
    { id: "p9", name: "Cable Management Kit", price: 14.99, image: "cables", category: "Accessories", rating: 3.9, inStock: true },
    { id: "p10", name: "Wireless Charger Pad", price: 19.99, image: "charger", category: "Electronics", rating: 4.0, inStock: true },
    { id: "p11", name: "Noise Cancelling Earbuds", price: 149.99, image: "earbuds", category: "Electronics", rating: 4.7, inStock: true },
    { id: "p12", name: "Portable SSD 1TB", price: 89.99, image: "ssd", category: "Electronics", rating: 4.6, inStock: true },
];

const SHIPPING_COSTS = { standard: 5.99, express: 12.99, overnight: 24.99 };
const SHIPPING_LABELS = { standard: "Standard (5-7 days)", express: "Express (2-3 days)", overnight: "Overnight (1 day)" };

const STEPS: { key: Step; label: string }[] = [
    { key: "products", label: "Browse" },
    { key: "cart", label: "Cart" },
    { key: "shipping", label: "Shipping" },
    { key: "payment", label: "Payment" },
    { key: "confirmation", label: "Confirm" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toFixed(2)}`;

const emptyShipping: ShippingInfo = {
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "US",
    shippingMethod: "standard",
};

const emptyPayment: PaymentInfo = {
    cardName: "", cardNumber: "", expiry: "", cvv: "",
    billingAddress: "same",
};

// ─────────────────────────────────────────────────────────────────────────────
// Product Icon (simple SVG placeholders)
// ─────────────────────────────────────────────────────────────────────────────
function ProductIcon({ type }: { type: string }) {
    const iconMap: Record<string, React.ReactNode> = {
        headphones: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>,
        adapter: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="10" rx="2" /><circle cx="7" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="17" cy="12" r="1.5" /></svg>,
        keyboard: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="6" width="20" height="12" rx="2" /><line x1="6" y1="10" x2="6" y2="10.01" /><line x1="10" y1="10" x2="10" y2="10.01" /><line x1="14" y1="10" x2="14" y2="10.01" /><line x1="18" y1="10" x2="18" y2="10.01" /><line x1="8" y1="14" x2="16" y2="14" /></svg>,
        mouse: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="3" width="12" height="18" rx="6" /><line x1="12" y1="7" x2="12" y2="11" /></svg>,
        stand: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
        sleeve: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16" /></svg>,
        webcam: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="10" r="5" /><circle cx="12" cy="10" r="2" /><path d="M8 20h8" /><path d="M12 15v5" /></svg>,
        lamp: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 00-4 12.7V18h8v-3.3A7 7 0 0012 2z" /></svg>,
        cables: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9h3v6H4z" /><path d="M17 9h3v6h-3z" /><path d="M7 12h10" /></svg>,
        charger: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M13 8l-4 5h6l-4 5" /></svg>,
        earbuds: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="4" /><circle cx="16" cy="8" r="4" /><path d="M8 12v6" /><path d="M16 12v6" /></svg>,
        ssd: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 10h2v4H7z" /><circle cx="16" cy="12" r="1" /></svg>,
    };
    return <div style={{ color: "var(--accent-primary)", opacity: 0.8 }}>{iconMap[type] || iconMap.charger}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Star Rating
// ─────────────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
    return (
        <span style={{ color: "#f59e0b", fontSize: "14px", letterSpacing: "1px" }}>
            {"★".repeat(Math.floor(rating))}
            {rating % 1 >= 0.5 ? "½" : ""}
            {"☆".repeat(5 - Math.ceil(rating))}
            <span style={{ color: "var(--text-secondary)", marginLeft: "4px", fontSize: "12px" }}>{rating}</span>
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
export default function EcommerceCheckoutPage() {
    const { logAction } = useActivity();
    const log = (msg: string) => logAction(msg, "Ecommerce");

    const [step, setStep] = useState<Step>("products");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [shipping, setShipping] = useState<ShippingInfo>(emptyShipping);
    const [payment, setPayment] = useState<PaymentInfo>(emptyPayment);
    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
    const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
    const [orderId, setOrderId] = useState("");

    const categories = ["All", ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

    // ── Cart Helpers ──
    const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const shippingCost = SHIPPING_COSTS[shipping.shippingMethod];
    const discount = couponApplied ? cartTotal * 0.1 : 0;
    const tax = (cartTotal - discount) * 0.08;
    const orderTotal = cartTotal - discount + shippingCost + tax;

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
        log(`Added "${product.name}" to cart`);
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            setCart(cart.filter(item => item.product.id !== productId));
            log(`Removed item from cart`);
        } else {
            setCart(cart.map(item => item.product.id === productId ? { ...item, quantity } : item));
            log(`Updated quantity to ${quantity}`);
        }
    };

    const removeFromCart = (productId: string) => {
        const item = cart.find(i => i.product.id === productId);
        setCart(cart.filter(i => i.product.id !== productId));
        if (item) log(`Removed "${item.product.name}" from cart`);
    };

    const applyCoupon = () => {
        if (couponCode.toUpperCase() === "SAVE10") {
            setCouponApplied(true);
            log("Applied coupon code SAVE10 (10% off)");
        } else {
            log(`Invalid coupon code: ${couponCode}`);
        }
    };

    // ── Validation ──
    const validateShipping = (): boolean => {
        const errors: Record<string, string> = {};
        if (!shipping.firstName.trim()) errors.firstName = "First name is required";
        if (!shipping.lastName.trim()) errors.lastName = "Last name is required";
        if (!shipping.email.trim()) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) errors.email = "Invalid email format";
        if (!shipping.phone.trim()) errors.phone = "Phone is required";
        if (!shipping.address.trim()) errors.address = "Address is required";
        if (!shipping.city.trim()) errors.city = "City is required";
        if (!shipping.state.trim()) errors.state = "State is required";
        if (!shipping.zip.trim()) errors.zip = "ZIP code is required";
        else if (!/^\d{5}(-\d{4})?$/.test(shipping.zip)) errors.zip = "Invalid ZIP format";
        setShippingErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePayment = (): boolean => {
        const errors: Record<string, string> = {};
        if (!payment.cardName.trim()) errors.cardName = "Cardholder name is required";
        if (!payment.cardNumber.trim()) errors.cardNumber = "Card number is required";
        else if (payment.cardNumber.replace(/\s/g, "").length !== 16) errors.cardNumber = "Card number must be 16 digits";
        if (!payment.expiry.trim()) errors.expiry = "Expiry is required";
        else if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) errors.expiry = "Use MM/YY format";
        if (!payment.cvv.trim()) errors.cvv = "CVV is required";
        else if (!/^\d{3,4}$/.test(payment.cvv)) errors.cvv = "Invalid CVV";
        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Navigation ──
    const goToStep = (target: Step) => {
        if (target === "cart" || target === "products") {
            setStep(target);
            log(`Navigated to ${target}`);
            return;
        }
        if (target === "shipping" && cart.length === 0) {
            log("Cannot proceed: cart is empty");
            return;
        }
        if (target === "payment") {
            if (!validateShipping()) {
                log("Shipping validation failed");
                return;
            }
        }
        if (target === "confirmation") {
            if (!validatePayment()) {
                log("Payment validation failed");
                return;
            }
            setOrderId(`ORD-${Date.now().toString(36).toUpperCase()}`);
            log("Order placed successfully!");
        }
        setStep(target);
        log(`Navigated to ${target}`);
    };

    const resetAll = () => {
        setStep("products");
        setCart([]);
        setShipping(emptyShipping);
        setPayment(emptyPayment);
        setCouponCode("");
        setCouponApplied(false);
        setShippingErrors({});
        setPaymentErrors({});
        setOrderId("");
        setSearchQuery("");
        setCategoryFilter("All");
        log("Reset checkout flow");
    };

    // ── Filter products ──
    const filteredProducts = PRODUCTS.filter(p => {
        const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
        const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const stepIndex = STEPS.findIndex(s => s.key === step);

    return (
        <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
            {/* Side Navigation */}
            <EcommerceSideNav step={step} cartCount={cartCount} onNavigate={goToStep} />

            {/* Main Content */}
            <div className="container fade-in main-container ecom-main-content">
                {/* Header */}
                <div className="ecom-header">
                    <div>
                        <h1 className="h1" style={{ marginBottom: "4px" }}>E-Commerce Checkout</h1>
                        <p className="body-sm" style={{ color: "var(--text-secondary)" }}>
                            Complete checkout flow verification — browse, cart, shipping, payment, confirmation
                        </p>
                    </div>
                    <button
                        onClick={resetAll}
                        data-testid="reset-checkout"
                        style={resetBtnStyle}
                    >
                        Reset All
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="ecom-progress-bar">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <button
                                onClick={() => {
                                    if (i <= stepIndex || s.key === "products" || s.key === "cart") goToStep(s.key);
                                }}
                                data-testid={`step-${s.key}`}
                                style={{
                                    display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap",
                                    background: step === s.key ? "var(--accent-primary)" : i < stepIndex ? "var(--accent-green, #22c55e)" : "transparent",
                                    color: step === s.key || i < stepIndex ? "#fff" : "var(--text-secondary)",
                                    border: "none", borderRadius: "8px", padding: "8px 16px", flexShrink: 0,
                                    cursor: i <= stepIndex || s.key === "products" || s.key === "cart" ? "pointer" : "default",
                                    fontWeight: step === s.key ? 600 : 400, fontSize: "13px",
                                    opacity: i > stepIndex && s.key !== "products" && s.key !== "cart" ? 0.5 : 1,
                                    transition: "all 0.2s",
                                }}
                            >
                                <span style={{
                                    width: "22px", height: "22px", borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    background: step === s.key ? "rgba(255,255,255,0.2)" : i < stepIndex ? "rgba(255,255,255,0.3)" : "var(--bg-card)",
                                    fontSize: "11px", fontWeight: 700,
                                }}>
                                    {i < stepIndex ? "✓" : i + 1}
                                </span>
                                {s.label}
                            </button>
                            {i < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: "2px", background: i < stepIndex ? "var(--accent-green, #22c55e)" : "var(--border-light)", margin: "0 4px" }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                {step === "products" && (
                    <ProductsStep
                        products={filteredProducts}
                        categories={categories}
                        categoryFilter={categoryFilter}
                        searchQuery={searchQuery}
                        cart={cart}
                        onCategoryChange={(c) => { setCategoryFilter(c); log(`Filter: ${c}`); }}
                        onSearchChange={(q) => setSearchQuery(q)}
                        onAddToCart={addToCart}
                        onProceed={() => goToStep("cart")}
                        cartCount={cartCount}
                    />
                )}
                {step === "cart" && (
                    <CartStep
                        cart={cart}
                        couponCode={couponCode}
                        couponApplied={couponApplied}
                        cartTotal={cartTotal}
                        discount={discount}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                        onCouponChange={setCouponCode}
                        onApplyCoupon={applyCoupon}
                        onBack={() => goToStep("products")}
                        onProceed={() => goToStep("shipping")}
                    />
                )}
                {step === "shipping" && (
                    <ShippingStep
                        shipping={shipping}
                        errors={shippingErrors}
                        onChange={(field, value) => {
                            setShipping({ ...shipping, [field]: value });
                            if (shippingErrors[field]) setShippingErrors({ ...shippingErrors, [field]: "" });
                        }}
                        onBack={() => goToStep("cart")}
                        onProceed={() => goToStep("payment")}
                    />
                )}
                {step === "payment" && (
                    <PaymentStep
                        payment={payment}
                        errors={paymentErrors}
                        cartTotal={cartTotal}
                        discount={discount}
                        shippingCost={shippingCost}
                        tax={tax}
                        orderTotal={orderTotal}
                        onChange={(field, value) => {
                            setPayment({ ...payment, [field]: value });
                            if (paymentErrors[field]) setPaymentErrors({ ...paymentErrors, [field]: "" });
                        }}
                        onBack={() => goToStep("shipping")}
                        onProceed={() => goToStep("confirmation")}
                    />
                )}
                {step === "confirmation" && (
                    <ConfirmationStep
                        orderId={orderId}
                        cart={cart}
                        shipping={shipping}
                        cartTotal={cartTotal}
                        discount={discount}
                        shippingCost={shippingCost}
                        tax={tax}
                        orderTotal={orderTotal}
                        onReset={resetAll}
                    />
                )}
            </div>

            <style jsx global>{`
                .ecom-main-content {
                    flex: 1;
                    padding: 60px 40px;
                    min-width: 0;
                }
                .product-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.1));
                }
                .ecom-input:focus {
                    border-color: var(--accent-primary);
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
                .ecom-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                .side-nav-container {
                    display: flex;
                }
                .ecom-progress-bar {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    margin-bottom: 32px;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 8px 16px;
                }
                .ecom-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    gap: 16px;
                }
                .cart-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 24px;
                }
                .payment-grid {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 24px;
                }
                .shipping-form {
                    max-width: 640px;
                }
                .shipping-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 20px;
                }
                .filter-bar {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .cart-item-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    background: var(--bg-card);
                    border-radius: 12px;
                    border: 1px solid var(--border-light);
                }
                .confirmation-wrapper {
                    max-width: 640px;
                    margin: 0 auto;
                    text-align: center;
                }
                @media (max-width: 1023px) {
                    .side-nav-container {
                        display: none;
                    }
                }
                @media (max-width: 768px) {
                    .ecom-main-content {
                        padding: 40px 20px;
                    }
                    .shipping-form {
                        max-width: 100%;
                    }
                    .ecom-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .ecom-progress-bar {
                        overflow-x: auto;
                        padding: 8px 8px;
                        gap: 0;
                        -webkit-overflow-scrolling: touch;
                    }
                    .cart-grid {
                        grid-template-columns: 1fr;
                    }
                    .payment-grid {
                        grid-template-columns: 1fr;
                    }
                    .shipping-fields {
                        grid-template-columns: 1fr;
                    }
                    .product-grid {
                        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                        gap: 12px;
                    }
                    .filter-bar {
                        gap: 8px;
                    }
                    .cart-item-row {
                        flex-wrap: wrap;
                        gap: 12px;
                        padding: 12px 14px;
                    }
                    .confirmation-wrapper {
                        max-width: 100%;
                    }
                }
                @media (max-width: 480px) {
                    .product-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Side Navigation
// ─────────────────────────────────────────────────────────────────────────────
function EcommerceSideNav({ step, cartCount, onNavigate }: { step: Step; cartCount: number; onNavigate: (s: Step) => void }) {
    const items: { key: Step; label: string; icon: string }[] = [
        { key: "products", label: "Products", icon: "🛍" },
        { key: "cart", label: `Cart (${cartCount})`, icon: "🛒" },
        { key: "shipping", label: "Shipping", icon: "📦" },
        { key: "payment", label: "Payment", icon: "💳" },
        { key: "confirmation", label: "Confirmation", icon: "✅" },
    ];

    return (
        <div className="side-nav-container" style={{
            width: "48px", flexShrink: 0, display: "flex", flexDirection: "column",
            alignItems: "center", paddingTop: "32px", gap: "8px",
            borderRight: "1px solid var(--border-light)", background: "var(--bg-secondary)",
        }}>
            {items.map(item => (
                <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    data-testid={`sidenav-${item.key}`}
                    title={item.label}
                    style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        border: "none", cursor: "pointer", fontSize: "16px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: step === item.key ? "var(--accent-primary)" : "transparent",
                        filter: step === item.key ? "none" : "grayscale(0.5)",
                        opacity: step === item.key ? 1 : 0.7,
                        transition: "all 0.2s",
                    }}
                >
                    {item.icon}
                </button>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Products
// ─────────────────────────────────────────────────────────────────────────────
function ProductsStep({ products, categories, categoryFilter, searchQuery, cart, onCategoryChange, onSearchChange, onAddToCart, onProceed, cartCount }: {
    products: Product[]; categories: string[]; categoryFilter: string; searchQuery: string;
    cart: CartItem[]; onCategoryChange: (c: string) => void; onSearchChange: (q: string) => void;
    onAddToCart: (p: Product) => void; onProceed: () => void; cartCount: number;
}) {
    return (
        <div>
            {/* Filters */}
            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    className="ecom-input"
                    data-testid="product-search"
                    style={inputStyle}
                />
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        data-testid={`category-${cat.toLowerCase()}`}
                        style={{
                            padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-light)",
                            background: categoryFilter === cat ? "var(--accent-primary)" : "var(--bg-card)",
                            color: categoryFilter === cat ? "#fff" : "var(--text-primary)",
                            cursor: "pointer", fontSize: "13px", fontWeight: 500, transition: "all 0.2s",
                        }}
                    >
                        {cat}
                    </button>
                ))}
                <div style={{ marginLeft: "auto" }}>
                    <button
                        onClick={onProceed}
                        data-testid="go-to-cart"
                        className="ecom-btn"
                        disabled={cartCount === 0}
                        style={{
                            ...primaryBtnStyle,
                            opacity: cartCount === 0 ? 0.5 : 1,
                            cursor: cartCount === 0 ? "not-allowed" : "pointer",
                        }}
                    >
                        View Cart ({cartCount})
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="product-grid">
                {products.map(product => {
                    const inCart = cart.find(i => i.product.id === product.id);
                    return (
                        <div key={product.id} className="product-card" data-testid={`product-${product.id}`} style={{
                            background: "var(--bg-card)", borderRadius: "16px", padding: "24px",
                            border: "1px solid var(--border-light)", transition: "all 0.2s", cursor: "default",
                        }}>
                            <div style={{ display: "flex", justifyContent: "center", padding: "16px 0", background: "var(--bg-secondary)", borderRadius: "12px", marginBottom: "16px" }}>
                                <ProductIcon type={product.image} />
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--accent-primary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                                {product.category}
                            </div>
                            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px", color: "var(--text-primary)" }}>{product.name}</h3>
                            <Stars rating={product.rating} />
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                                <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{fmt(product.price)}</span>
                                {!product.inStock ? (
                                    <span style={{ fontSize: "12px", color: "var(--accent-red, #ef4444)", fontWeight: 500 }}>Out of Stock</span>
                                ) : inCart ? (
                                    <span style={{ fontSize: "12px", color: "var(--accent-green, #22c55e)", fontWeight: 600 }}>
                                        In Cart ({inCart.quantity})
                                    </span>
                                ) : null}
                            </div>
                            <button
                                onClick={() => onAddToCart(product)}
                                disabled={!product.inStock}
                                data-testid={`add-to-cart-${product.id}`}
                                className="ecom-btn"
                                style={{
                                    width: "100%", marginTop: "12px", padding: "10px",
                                    background: product.inStock ? "var(--accent-primary)" : "var(--bg-secondary)",
                                    color: product.inStock ? "#fff" : "var(--text-secondary)",
                                    border: "none", borderRadius: "10px", cursor: product.inStock ? "pointer" : "not-allowed",
                                    fontWeight: 600, fontSize: "13px", transition: "all 0.2s",
                                }}
                            >
                                {!product.inStock ? "Unavailable" : inCart ? "Add Another" : "Add to Cart"}
                            </button>
                        </div>
                    );
                })}
            </div>
            {products.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px", color: "var(--text-secondary)" }}>
                    No products match your search.
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Cart
// ─────────────────────────────────────────────────────────────────────────────
function CartStep({ cart, couponCode, couponApplied, cartTotal, discount, onUpdateQuantity, onRemove, onCouponChange, onApplyCoupon, onBack, onProceed }: {
    cart: CartItem[]; couponCode: string; couponApplied: boolean; cartTotal: number; discount: number;
    onUpdateQuantity: (id: string, qty: number) => void; onRemove: (id: string) => void;
    onCouponChange: (c: string) => void; onApplyCoupon: () => void; onBack: () => void; onProceed: () => void;
}) {
    if (cart.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</div>
                <h2 style={{ marginBottom: "8px", color: "var(--text-primary)" }}>Your cart is empty</h2>
                <p className="body-sm" style={{ marginBottom: "24px", color: "var(--text-secondary)" }}>Browse products and add items to get started.</p>
                <button onClick={onBack} className="ecom-btn" data-testid="continue-shopping" style={primaryBtnStyle}>Continue Shopping</button>
            </div>
        );
    }

    return (
        <div className="cart-grid">
            {/* Cart Items */}
            <div>
                <h2 className="h2" style={{ marginBottom: "16px" }}>Cart Items ({cart.length})</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {cart.map(item => (
                        <div key={item.product.id} data-testid={`cart-item-${item.product.id}`} className="cart-item-row">
                            <div style={{ width: "56px", height: "56px", background: "var(--bg-secondary)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ProductIcon type={item.product.image} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{item.product.name}</div>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{fmt(item.product.price)} each</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                    data-testid={`qty-decrease-${item.product.id}`}
                                    style={qtyBtnStyle}
                                >−</button>
                                <span data-testid={`qty-value-${item.product.id}`} style={{ width: "32px", textAlign: "center", fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                    data-testid={`qty-increase-${item.product.id}`}
                                    style={qtyBtnStyle}
                                >+</button>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: "15px", width: "80px", textAlign: "right", color: "var(--text-primary)" }}>
                                {fmt(item.product.price * item.quantity)}
                            </div>
                            <button
                                onClick={() => onRemove(item.product.id)}
                                data-testid={`remove-${item.product.id}`}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-red, #ef4444)", fontSize: "18px", padding: "4px" }}
                            >×</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border-light)", height: "fit-content", position: "sticky", top: "96px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "var(--text-primary)" }}>Order Summary</h3>

                {/* Coupon */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                    <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={e => onCouponChange(e.target.value)}
                        className="ecom-input"
                        data-testid="coupon-input"
                        disabled={couponApplied}
                        style={{ ...inputStyle, flex: 1, fontSize: "13px" }}
                    />
                    <button
                        onClick={onApplyCoupon}
                        data-testid="apply-coupon"
                        disabled={couponApplied || !couponCode}
                        style={{
                            padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-light)",
                            background: couponApplied ? "var(--accent-green, #22c55e)" : "var(--bg-secondary)",
                            color: couponApplied ? "#fff" : "var(--text-primary)",
                            cursor: couponApplied ? "default" : "pointer", fontSize: "13px", fontWeight: 500,
                        }}
                    >
                        {couponApplied ? "Applied" : "Apply"}
                    </button>
                </div>
                {!couponApplied && (
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "-12px", marginBottom: "16px" }}>
                        Try: SAVE10
                    </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                        <span>Subtotal</span><span data-testid="cart-subtotal">{fmt(cartTotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--accent-green, #22c55e)" }}>
                            <span>Discount (10%)</span><span data-testid="cart-discount">-{fmt(discount)}</span>
                        </div>
                    )}
                    <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>
                        <span>Total</span><span data-testid="cart-total">{fmt(cartTotal - discount)}</span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                    <button onClick={onBack} data-testid="back-to-products" style={secondaryBtnStyle}>Back</button>
                    <button onClick={onProceed} data-testid="proceed-to-shipping" className="ecom-btn" style={{ ...primaryBtnStyle, flex: 1 }}>
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Shipping
// ─────────────────────────────────────────────────────────────────────────────
function ShippingStep({ shipping, errors, onChange, onBack, onProceed }: {
    shipping: ShippingInfo; errors: Record<string, string>;
    onChange: (field: string, value: string) => void; onBack: () => void; onProceed: () => void;
}) {
    const fieldStyle = (field: string): React.CSSProperties => ({
        ...inputStyle,
        width: "100%",
        borderColor: errors[field] ? "var(--accent-red, #ef4444)" : "var(--border-light)",
    });

    return (
        <div className="shipping-form">
            <h2 className="h2" style={{ marginBottom: "24px" }}>Shipping Information</h2>
            <div className="shipping-fields">
                <FormField label="First Name" error={errors.firstName}>
                    <input type="text" value={shipping.firstName} onChange={e => onChange("firstName", e.target.value)}
                        className="ecom-input" data-testid="shipping-firstName" style={fieldStyle("firstName")} placeholder="John" />
                </FormField>
                <FormField label="Last Name" error={errors.lastName}>
                    <input type="text" value={shipping.lastName} onChange={e => onChange("lastName", e.target.value)}
                        className="ecom-input" data-testid="shipping-lastName" style={fieldStyle("lastName")} placeholder="Doe" />
                </FormField>
                <FormField label="Email" error={errors.email}>
                    <input type="email" value={shipping.email} onChange={e => onChange("email", e.target.value)}
                        className="ecom-input" data-testid="shipping-email" style={fieldStyle("email")} placeholder="john@example.com" />
                </FormField>
                <FormField label="Phone" error={errors.phone}>
                    <input type="tel" value={shipping.phone} onChange={e => onChange("phone", e.target.value)}
                        className="ecom-input" data-testid="shipping-phone" style={fieldStyle("phone")} placeholder="(555) 123-4567" />
                </FormField>
                <FormField label="Address" error={errors.address} span={2}>
                    <input type="text" value={shipping.address} onChange={e => onChange("address", e.target.value)}
                        className="ecom-input" data-testid="shipping-address" style={fieldStyle("address")} placeholder="123 Main St" />
                </FormField>
                <FormField label="City" error={errors.city}>
                    <input type="text" value={shipping.city} onChange={e => onChange("city", e.target.value)}
                        className="ecom-input" data-testid="shipping-city" style={fieldStyle("city")} placeholder="New York" />
                </FormField>
                <FormField label="State" error={errors.state}>
                    <input type="text" value={shipping.state} onChange={e => onChange("state", e.target.value)}
                        className="ecom-input" data-testid="shipping-state" style={fieldStyle("state")} placeholder="NY" />
                </FormField>
                <FormField label="ZIP Code" error={errors.zip}>
                    <input type="text" value={shipping.zip} onChange={e => onChange("zip", e.target.value)}
                        className="ecom-input" data-testid="shipping-zip" style={fieldStyle("zip")} placeholder="10001" />
                </FormField>
                <FormField label="Country" error={errors.country}>
                    <select value={shipping.country} onChange={e => onChange("country", e.target.value)}
                        data-testid="shipping-country" style={{ ...fieldStyle("country"), cursor: "pointer" }}>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="AU">Australia</option>
                        <option value="IN">India</option>
                    </select>
                </FormField>
            </div>

            {/* Shipping Method */}
            <div style={{ marginTop: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "var(--text-primary)" }}>Shipping Method</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(["standard", "express", "overnight"] as const).map(method => (
                        <label key={method} data-testid={`shipping-method-${method}`} style={{
                            display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
                            background: shipping.shippingMethod === method ? "var(--bg-card)" : "var(--bg-secondary)",
                            border: shipping.shippingMethod === method ? "2px solid var(--accent-primary)" : "1px solid var(--border-light)",
                            borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
                        }}>
                            <input
                                type="radio" name="shippingMethod" value={method}
                                checked={shipping.shippingMethod === method}
                                onChange={() => onChange("shippingMethod", method)}
                                style={{ accentColor: "var(--accent-primary)" }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--text-primary)" }}>{SHIPPING_LABELS[method]}</div>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{fmt(SHIPPING_COSTS[method])}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
                <button onClick={onBack} data-testid="back-to-cart" style={secondaryBtnStyle}>Back to Cart</button>
                <button onClick={onProceed} data-testid="proceed-to-payment" className="ecom-btn" style={primaryBtnStyle}>Continue to Payment</button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Payment
// ─────────────────────────────────────────────────────────────────────────────
function PaymentStep({ payment, errors, cartTotal, discount, shippingCost, tax, orderTotal, onChange, onBack, onProceed }: {
    payment: PaymentInfo; errors: Record<string, string>;
    cartTotal: number; discount: number; shippingCost: number; tax: number; orderTotal: number;
    onChange: (field: string, value: string) => void; onBack: () => void; onProceed: () => void;
}) {
    const fieldStyle = (field: string): React.CSSProperties => ({
        ...inputStyle,
        width: "100%",
        borderColor: errors[field] ? "var(--accent-red, #ef4444)" : "var(--border-light)",
    });

    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 16);
        return digits.replace(/(.{4})/g, "$1 ").trim();
    };

    const formatExpiry = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 4);
        if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
        return digits;
    };

    return (
        <div className="payment-grid">
            <div>
                <h2 className="h2" style={{ marginBottom: "24px" }}>Payment Details</h2>
                <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border-light)" }}>
                    {/* Card Visual */}
                    <div style={{
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "14px",
                        padding: "24px", color: "#fff", marginBottom: "24px", minHeight: "160px",
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", opacity: 0.8, letterSpacing: "1px" }}>CREDIT CARD</span>
                            <svg width="32" height="24" viewBox="0 0 32 24"><rect width="32" height="24" rx="4" fill="rgba(255,255,255,0.2)" /><circle cx="12" cy="12" r="6" fill="rgba(255,255,255,0.4)" /><circle cx="20" cy="12" r="6" fill="rgba(255,255,255,0.3)" /></svg>
                        </div>
                        <div style={{ fontSize: "18px", letterSpacing: "3px", fontFamily: "monospace" }}>
                            {payment.cardNumber || "•••• •••• •••• ••••"}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                            <span>{payment.cardName || "CARDHOLDER NAME"}</span>
                            <span>{payment.expiry || "MM/YY"}</span>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <FormField label="Cardholder Name" error={errors.cardName} span={2}>
                            <input type="text" value={payment.cardName} onChange={e => onChange("cardName", e.target.value)}
                                className="ecom-input" data-testid="payment-cardName" style={fieldStyle("cardName")} placeholder="John Doe" />
                        </FormField>
                        <FormField label="Card Number" error={errors.cardNumber} span={2}>
                            <input type="text" value={payment.cardNumber} onChange={e => onChange("cardNumber", formatCardNumber(e.target.value))}
                                className="ecom-input" data-testid="payment-cardNumber" style={fieldStyle("cardNumber")} placeholder="1234 5678 9012 3456" />
                        </FormField>
                        <FormField label="Expiry Date" error={errors.expiry}>
                            <input type="text" value={payment.expiry} onChange={e => onChange("expiry", formatExpiry(e.target.value))}
                                className="ecom-input" data-testid="payment-expiry" style={fieldStyle("expiry")} placeholder="MM/YY" />
                        </FormField>
                        <FormField label="CVV" error={errors.cvv}>
                            <input type="text" value={payment.cvv} onChange={e => onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                                className="ecom-input" data-testid="payment-cvv" style={fieldStyle("cvv")} placeholder="123" />
                        </FormField>
                    </div>

                    <div style={{ marginTop: "16px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
                            <input type="checkbox" checked={payment.billingAddress === "same"} onChange={e => onChange("billingAddress", e.target.checked ? "same" : "different")}
                                data-testid="billing-same" style={{ accentColor: "var(--accent-primary)" }} />
                            Billing address same as shipping
                        </label>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button onClick={onBack} data-testid="back-to-shipping" style={secondaryBtnStyle}>Back</button>
                    <button onClick={onProceed} data-testid="place-order" className="ecom-btn" style={primaryBtnStyle}>Place Order</button>
                </div>
            </div>

            {/* Summary Sidebar */}
            <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border-light)", height: "fit-content", position: "sticky", top: "96px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--text-primary)" }}>Order Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                    <SummaryRow label="Subtotal" value={fmt(cartTotal)} />
                    {discount > 0 && <SummaryRow label="Discount" value={`-${fmt(discount)}`} color="var(--accent-green, #22c55e)" />}
                    <SummaryRow label="Shipping" value={fmt(shippingCost)} />
                    <SummaryRow label="Tax (8%)" value={fmt(tax)} />
                    <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "18px", color: "var(--text-primary)" }}>
                        <span>Total</span><span data-testid="order-total">{fmt(orderTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5: Confirmation
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmationStep({ orderId, cart, shipping, cartTotal, discount, shippingCost, tax, orderTotal, onReset }: {
    orderId: string; cart: CartItem[]; shipping: ShippingInfo;
    cartTotal: number; discount: number; shippingCost: number; tax: number; orderTotal: number;
    onReset: () => void;
}) {
    return (
        <div className="confirmation-wrapper">
            {/* Success Header */}
            <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "var(--accent-green, #22c55e)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "36px", margin: "0 auto 20px",
            }}>
                ✓
            </div>
            <h2 className="h2" style={{ marginBottom: "4px" }}>Order Confirmed!</h2>
            <p className="body-sm" style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
                Thank you for your purchase
            </p>
            <div data-testid="order-id" style={{
                display: "inline-block", padding: "6px 16px", borderRadius: "8px",
                background: "var(--bg-secondary)", fontFamily: "monospace", fontWeight: 600,
                fontSize: "14px", color: "var(--accent-primary)", marginBottom: "28px",
            }}>
                {orderId}
            </div>

            {/* Order Details */}
            <div style={{ textAlign: "left", background: "var(--bg-card)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border-light)", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", color: "var(--text-primary)" }}>Items Ordered</h3>
                {cart.map(item => (
                    <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-light)", fontSize: "14px" }}>
                        <span style={{ color: "var(--text-primary)" }}>{item.product.name} × {item.quantity}</span>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fmt(item.product.price * item.quantity)}</span>
                    </div>
                ))}
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
                    <SummaryRow label="Subtotal" value={fmt(cartTotal)} />
                    {discount > 0 && <SummaryRow label="Discount" value={`-${fmt(discount)}`} color="var(--accent-green, #22c55e)" />}
                    <SummaryRow label="Shipping" value={fmt(shippingCost)} />
                    <SummaryRow label="Tax" value={fmt(tax)} />
                    <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "8px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "16px", color: "var(--text-primary)" }}>
                        <span>Total</span><span data-testid="confirmation-total">{fmt(orderTotal)}</span>
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            <div style={{ textAlign: "left", background: "var(--bg-card)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border-light)", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>Shipping To</h3>
                <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--text-secondary)" }} data-testid="confirmation-address">
                    {shipping.firstName} {shipping.lastName}<br />
                    {shipping.address}<br />
                    {shipping.city}, {shipping.state} {shipping.zip}<br />
                    {shipping.email}
                </p>
                <p style={{ fontSize: "13px", color: "var(--accent-primary)", marginTop: "8px", fontWeight: 500 }}>
                    {SHIPPING_LABELS[shipping.shippingMethod]}
                </p>
            </div>

            <button onClick={onReset} data-testid="new-order" className="ecom-btn" style={primaryBtnStyle}>
                Start New Order
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Components
// ─────────────────────────────────────────────────────────────────────────────
function FormField({ label, error, children, span }: { label: string; error?: string; children: React.ReactNode; span?: number }) {
    return (
        <div style={{ gridColumn: span === 2 ? "span 2" : undefined }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {label}
            </label>
            {children}
            {error && <div style={{ fontSize: "12px", color: "var(--accent-red, #ef4444)", marginTop: "4px" }}>{error}</div>}
        </div>
    );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", color: color || "var(--text-secondary)" }}>
            <span>{label}</span><span>{value}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Styles
// ─────────────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
    padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-light)",
    background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "14px",
    outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
};

const primaryBtnStyle: React.CSSProperties = {
    padding: "10px 24px", borderRadius: "10px", border: "none",
    background: "var(--accent-primary)", color: "#fff",
    fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
};

const secondaryBtnStyle: React.CSSProperties = {
    padding: "10px 24px", borderRadius: "10px",
    border: "1px solid var(--border-light)", background: "var(--bg-card)",
    color: "var(--text-primary)", fontSize: "14px", fontWeight: 500,
    cursor: "pointer", transition: "all 0.2s",
};

const qtyBtnStyle: React.CSSProperties = {
    width: "28px", height: "28px", borderRadius: "8px", border: "1px solid var(--border-light)",
    background: "var(--bg-secondary)", color: "var(--text-primary)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 600,
};

const resetBtnStyle: React.CSSProperties = {
    padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border-light)",
    background: "var(--bg-secondary)", color: "var(--text-secondary)",
    fontSize: "13px", fontWeight: 500, cursor: "pointer",
};
