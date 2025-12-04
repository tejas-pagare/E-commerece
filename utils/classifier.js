import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const classifyImage = (imageBuffer) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ml_models/classify.py');
        
        // Spawn python process
        // Ensure 'python' is in your PATH. If using a virtual env, point to that python executable.
        const pythonProcess = spawn('python', [scriptPath]);

        let dataString = '';
        let errorString = '';

        // Send image buffer to python script via stdin
        pythonProcess.stdin.write(imageBuffer);
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(`Stderr: ${errorString}`);
                console.error(`Stdout: ${dataString}`);

                // Try to parse error from stdout if available
                try {
                     const lines = dataString.trim().split('\n');
                     // Find the last JSON line
                     const jsonLines = lines.filter(line => line.trim().startsWith('{') && line.trim().endsWith('}'));
                     if (jsonLines.length > 0) {
                         const lastLine = jsonLines[jsonLines.length - 1];
                         const result = JSON.parse(lastLine);
                         if (result.error) {
                             return reject(new Error(result.error));
                         }
                     }
                } catch (e) {
                    // ignore parsing errors
                }

                // If the script fails (e.g. missing libraries), we reject.
                // You might want to allow fallback if ML is optional.
                return reject(new Error('Image classification failed (Check server logs for details)'));
            }

            try {
                // Parse the last line as JSON (in case of warnings printed before)
                const lines = dataString.trim().split('\n');
                // Filter for lines that look like JSON
                const jsonLines = lines.filter(line => line.trim().startsWith('{') && line.trim().endsWith('}'));
                
                if (jsonLines.length === 0) {
                     console.error("No JSON output from Python script. Raw output:", dataString);
                     return reject(new Error('Invalid response from classifier'));
                }

                const lastLine = jsonLines[jsonLines.length - 1];
                const result = JSON.parse(lastLine);
                
                if (result.error) {
                    return reject(new Error(result.error));
                }
                
                resolve(result);
            } catch (e) {
                console.error("Failed to parse Python output:", dataString);
                reject(new Error('Invalid response from classifier'));
            }
        });
    });
};
