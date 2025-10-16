import React, { useEffect, useState } from 'react';
import '../App.css';

interface User {
    id: number;
    name: string;
    email: string;
    address: {
        city: string;
    };
}

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/users')
            .then((response) => response.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Chargement...</div>;

    return (
        <div className='user-list'>
            <h2>Liste des utilisateurs</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <strong>{user.name}</strong> ({user.email}) - {user.address.city}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Users;