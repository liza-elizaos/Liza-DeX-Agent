import fetch from 'node-fetch';

async function checkEnv() {
  try {
    const response = await fetch('https://shina-aonh470c1-naquibmirza-6034s-projects.vercel.app/api/debug-env');
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEnv();
