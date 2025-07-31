console.log('Simple test script running...');
console.log('Current working directory:', process.cwd());
console.log('Node.js version:', process.version);
console.log('Environment variables:', Object.keys(process.env).filter(key => key.startsWith('DB_')));
console.log('Test completed successfully!');
