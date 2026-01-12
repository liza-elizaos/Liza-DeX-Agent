#!/usr/bin/env node
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testTokenCreation() {
    console.log('🧪 Testing Token Creation API...\n');

    try {
        // Prepare form data
        const form = new FormData();
        form.append('name', 'mem');
        form.append('symbol', 'Meme');
        form.append('description', 'A fun memecoin for the community');
        form.append('tone', 'edgy');

        // Add logo if it exists
        const logoPath = path.join(__dirname, 'meme_token.png');
        if (fs.existsSync(logoPath)) {
            console.log('📸 Adding logo:', logoPath);
            form.append('image', fs.createReadStream(logoPath));
        } else {
            console.log('⚠️  Logo not found, proceeding without image');
        }

        console.log('📤 Sending request to /api/token/create...\n');

        const response = await axios.post('http://localhost:3001/api/token/create', form, {
            headers: form.getHeaders(),
            timeout: 120000
        });

        console.log('✅ Success!\n');
        console.log('Response:', JSON.stringify(response.data, null, 2));

        if (response.data.mint) {
            console.log('\n🎉 Token created!');
            console.log(`   Mint Address: ${response.data.mint}`);
            if (response.data.transaction) {
                console.log(`   Transaction: ${response.data.transaction}`);
            }
            console.log(`   View on Solscan: https://solscan.io/token/${response.data.mint}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

testTokenCreation();
