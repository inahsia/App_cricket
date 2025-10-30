/**
 * Debug AsyncStorage
 * Run this with: node debug_storage.js
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

async function checkStorage() {
    try {
        console.log('=== AsyncStorage Debug ===\n');
        
        // Get all keys
        const keys = await AsyncStorage.getAllKeys();
        console.log('All keys:', keys);
        console.log('Total keys:', keys.length);
        
        // Get all values
        if (keys.length > 0) {
            const items = await AsyncStorage.multiGet(keys);
            console.log('\nAll stored data:');
            items.forEach(([key, value]) => {
                console.log(`\n${key}:`);
                if (key === 'authToken') {
                    console.log(`  ${value ? value.substring(0, 50) + '...' : 'NULL'}`);
                } else {
                    console.log(`  ${value}`);
                }
            });
        } else {
            console.log('\n⚠️ No data found in AsyncStorage!');
        }
        
        // Specifically check for authToken
        console.log('\n=== Auth Token Check ===');
        const token = await AsyncStorage.getItem('authToken');
        console.log('Auth Token:', token ? 'EXISTS ✅' : 'MISSING ❌');
        if (token) {
            console.log('Token preview:', token.substring(0, 80) + '...');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

checkStorage();
