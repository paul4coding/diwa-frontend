import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
    id: number;
    nom: string;
    prixUnitaire: number;
    imageUrl: string;
    quantity: number;
    stock: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('diwa_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('diwa_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: any) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                if (existingItem.quantity < product.quantiteStock) {
                    return prevCart.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                } else {
                    alert(`Désolé, stock insuffisant pour ${product.nom} (Max: ${product.quantiteStock})`);
                    return prevCart;
                }
            }
            return [...prevCart, { 
                id: product.id, 
                nom: product.nom, 
                prixUnitaire: product.prixUnitaire, 
                imageUrl: product.imageUrl, 
                quantity: 1,
                stock: product.quantiteStock
            }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) return;
        setCart(prevCart => prevCart.map(item => {
            if (item.id === productId) {
                if (quantity <= item.stock) {
                    return { ...item, quantity };
                } else {
                    alert(`Stock insuffisant (Max: ${item.stock})`);
                    return item;
                }
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const totalAmount = cart.reduce((sum, item) => sum + (item.prixUnitaire * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
