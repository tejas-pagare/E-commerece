import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const classifyImage = (imageBuffer) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ml_models/classify.py');

        const projectRoot = path.join(__dirname, '..');
        const venvDir = path.join(projectRoot, '.venv');
        const venvWindows = path.join(venvDir, 'Scripts', 'python.exe');
        const venvPosix = path.join(venvDir, 'bin', 'python');

        const candidates = [
            process.env.ML_PYTHON,
            process.env.PYTHON,
            fs.existsSync(venvWindows) ? venvWindows : null,
            fs.existsSync(venvPosix) ? venvPosix : null,
            'python',
            'py'
        ].filter(Boolean);

        const parseLastJson = (rawOutput) => {
            const lines = (rawOutput || '').trim().split('\n');
            const jsonLines = lines.filter((line) => line.trim().startsWith('{') && line.trim().endsWith('}'));
            if (!jsonLines.length) return null;
            return JSON.parse(jsonLines[jsonLines.length - 1]);
        };

        let settled = false;
        const safeResolve = (value) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };
        const safeReject = (err) => {
            if (settled) return;
            settled = true;
            reject(err);
        };

        const runWithCandidate = (index) => {
            if (index >= candidates.length) {
                return safeReject(new Error('No valid Python executable found. Set ML_PYTHON or ensure python/py is on PATH.'));
            }

            const pythonCmd = candidates[index];
            const child = spawn(pythonCmd, [scriptPath]);
            let dataString = '';
            let errorString = '';
            let movedNext = false;

            const moveToNextCandidate = () => {
                if (movedNext || settled) return;
                movedNext = true;
                runWithCandidate(index + 1);
            };

            child.on('error', (err) => {
                if (err.code === 'ENOENT') {
                    return moveToNextCandidate();
                }
                return safeReject(err);
            });

            child.stdout.on('data', (data) => {
                dataString += data.toString();
            });

            child.stderr.on('data', (data) => {
                errorString += data.toString();
            });

            child.on('close', (code) => {
                if (movedNext || settled) return;

                if (code !== 0) {
                    if (index < candidates.length - 1) {
                        return moveToNextCandidate();
                    }

                    try {
                        const result = parseLastJson(dataString);
                        if (result?.error) {
                            return safeReject(new Error(result.error));
                        }
                    } catch (e) {
                        // ignore parse errors and return generic classifier error below
                    }

                    // If a command alias exists but fails to execute script, try next candidate.
                    const stderrLower = (errorString || '').toLowerCase();
                    if (stderrLower.includes('not recognized') || stderrLower.includes('no such file or directory')) {
                        return moveToNextCandidate();
                    }

                    return safeReject(new Error('Image classification failed (Check server logs for details)'));
                }

                try {
                    const result = parseLastJson(dataString);
                    if (!result) {
                        return safeReject(new Error('Invalid response from classifier'));
                    }
                    if (result.error) {
                        return safeReject(new Error(result.error));
                    }
                    return safeResolve(result);
                } catch (e) {
                    return safeReject(new Error('Invalid response from classifier'));
                }
            });

            child.stdin.on('error', (err) => {
                if (movedNext || settled) return;

                // Python process may exit before stdin write completes.
                if (index < candidates.length - 1) {
                    return moveToNextCandidate();
                }

                return safeReject(new Error(`Image classification stdin error: ${err.message}`));
            });

            try {
                child.stdin.end(imageBuffer);
            } catch (err) {
                if (index < candidates.length - 1) {
                    return moveToNextCandidate();
                }
                return safeReject(new Error(`Image classification stdin error: ${err.message}`));
            }
        };

        runWithCandidate(0);
    });
};
