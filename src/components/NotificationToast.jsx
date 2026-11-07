import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Icon from './Icon';

export default function NotificationToast() {
    const { state } = useApp();
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (state.notifications.length > 0) {
            const latest = state.notifications[0];
            if (latest && !latest.shown) {
                setMessage(latest.text);
                setVisible(true);
                latest.shown = true;
                setTimeout(() => setVisible(false), 4000);
            }
        }
    }, [state.notifications]);

    if (!visible) return null;

    return (
        <div className="toast">
            <Icon name="notifications" size={20} color="var(--bd-teal)" />
            <span>{message}</span>
        </div>
    );
}