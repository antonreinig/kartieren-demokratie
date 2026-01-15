
import fs from 'fs';
import path from 'path';

export function logServer(message: string, data?: any) {
    const logPath = path.join(process.cwd(), 'server-debug.log');
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    fs.appendFileSync(logPath, logLine);
}
