import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
  userId?: string;
  endpoint?: string;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private logDir: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;

  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, meta, userId, endpoint, ip, userAgent } = entry;
    let logLine = `[${timestamp}] ${level}: ${message}`;
    
    if (userId) logLine += ` | User: ${userId}`;
    if (endpoint) logLine += ` | Endpoint: ${endpoint}`;
    if (ip) logLine += ` | IP: ${ip}`;
    if (userAgent) logLine += ` | UserAgent: ${userAgent}`;
    if (meta) logLine += ` | Meta: ${JSON.stringify(meta)}`;
    
    return logLine + '\n';
  }

  private getLogFileName(level: LogLevel): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level.toLowerCase()}-${date}.log`);
  }

  private rotateLogFile(filePath: string): void {
    if (!fs.existsSync(filePath)) return;
    
    const stats = fs.statSync(filePath);
    if (stats.size > this.maxFileSize) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedPath = filePath.replace('.log', `-${timestamp}.log`);
      fs.renameSync(filePath, rotatedPath);
      
      // Clean up old files
      this.cleanupOldLogs(path.dirname(filePath));
    }
  }

  private cleanupOldLogs(logDir: string): void {
    const files = fs.readdirSync(logDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        path: path.join(logDir, file),
        mtime: fs.statSync(path.join(logDir, file)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    if (files.length > this.maxFiles) {
      files.slice(this.maxFiles).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  }

  private writeLog(entry: LogEntry): void {
    const logFile = this.getLogFileName(entry.level);
    this.rotateLogFile(logFile);
    
    const logLine = this.formatLogEntry(entry);
    fs.appendFileSync(logFile, logLine);
    
    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(logLine.trim());
    }
  }

  public log(level: LogLevel, message: string, meta?: any, context?: {
    userId?: string;
    endpoint?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      ...context
    };
    
    this.writeLog(entry);
  }

  public error(message: string, meta?: any, context?: any): void {
    this.log(LogLevel.ERROR, message, meta, context);
  }

  public warn(message: string, meta?: any, context?: any): void {
    this.log(LogLevel.WARN, message, meta, context);
  }

  public info(message: string, meta?: any, context?: any): void {
    this.log(LogLevel.INFO, message, meta, context);
  }

  public debug(message: string, meta?: any, context?: any): void {
    this.log(LogLevel.DEBUG, message, meta, context);
  }

  // API specific logging methods
  public logApiRequest(req: any, res: any, duration?: number): void {
    const context = {
      endpoint: `${req.method} ${req.path}`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };
    
    const meta = {
      statusCode: res.statusCode,
      duration: duration ? `${duration}ms` : undefined,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    };
    
    this.info(`API Request: ${req.method} ${req.path}`, meta, context);
  }

  public logApiError(req: any, error: Error): void {
    const context = {
      endpoint: `${req.method} ${req.path}`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };
    
    const meta = {
      error: error.message,
      stack: error.stack,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    };
    
    this.error(`API Error: ${error.message}`, meta, context);
  }

  public logDatabaseOperation(operation: string, table: string, duration?: number, error?: Error): void {
    const meta = {
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined,
      error: error?.message
    };
    
    if (error) {
      this.error(`Database Error: ${operation} on ${table}`, meta);
    } else {
      this.debug(`Database Operation: ${operation} on ${table}`, meta);
    }
  }

  public logAuthEvent(event: string, userId?: string, ip?: string, success: boolean = true): void {
    const context = {
      userId,
      ip
    };
    
    const meta = {
      event,
      success
    };
    
    if (success) {
      this.info(`Auth Event: ${event}`, meta, context);
    } else {
      this.warn(`Auth Event Failed: ${event}`, meta, context);
    }
  }
}

export const logger = new Logger();
export default logger;