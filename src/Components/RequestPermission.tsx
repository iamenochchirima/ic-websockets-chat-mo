import React from 'react'

const RequestPermission = () => {
    
    const requestPermission = () => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                // Here, you might want to subscribe to some service or save this permission status
            } else {
                console.log('Notification permission denied.');
            }
        });
    };

    return (
        <div>
            <button onClick={requestPermission}>Enable Notifications</button>
        </div>
    );
}

export default RequestPermission