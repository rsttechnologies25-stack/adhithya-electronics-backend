const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('https://adhithya-electronics-api.onrender.com/auth/login', {
            email: 'admin@adhithya.com',
            password: 'admin123'
        });
        console.log('✅ Login Successful!');
        console.log('User Role:', response.data.user.role);
    } catch (error) {
        console.error('❌ Login Failed:', error.response ? error.response.status : error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

testLogin();
