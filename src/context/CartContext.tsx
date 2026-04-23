"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    size: string;
    quantity: number;
    slug: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string, size: string) => void;
    updateQuantity: (id: string, size: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("cart");
        if (stored) {
            setItems(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));
    }, [items]);

    const addItem = (newItem: CartItem) => {
        setItems((prev) => {
            const existing = prev.find(
                (i) => i.id === newItem.id && i.size === newItem.size
            );
            if (existing) {
                return prev.map((i) =>
                    i.id === newItem.id && i.size === newItem.size
                        ? { ...i, quantity: i.quantity + newItem.quantity }
                        : i
                );
            }
            return [...prev, newItem];
        });
        setIsOpen(true);
    };

    const removeItem = (id: string, size: string) => {
        setItems((prev) => prev.filter((i) => !(i.id === id && i.size === size)));
    };

    const updateQuantity = (id: string, size: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id, size);
            return;
        }
        setItems((prev) =>
            prev.map((i) =>
                i.id === id && i.size === size ? { ...i, quantity } : i
            )
        );
    };

    const clearCart = () => setItems([]);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
                isOpen,
                setIsOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
