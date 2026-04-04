import React from 'react';
import { useState, useEffect } from 'react';

const Page = () => {
    const [userEmail, setUserEmail] = useState('');

    // Simulate fetching user email
    useEffect(() => {
        const fetchUserEmail = () => {
            // Here you can replace with your actual fetching logic
            const email = 'user@example.com'; // Replace with your fetch logic
            setUserEmail(email);
        };
        fetchUserEmail();
    }, []);

    return (
        <div>
            <h1>Welcome to Neonadri</h1>
            {/* Conditionally rendering the Logout button */}
            {userEmail && userEmail !== '' && (
                <button onClick={() => alert('Logging out...')}>Logout</button>
            )}
        </div>
    );
};

export default Page;