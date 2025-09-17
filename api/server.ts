/**
 * Express server for development
 * This file is used by nodemon for local development
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and use API routes
import loginHandler from './auth/login';
import registerHandler from './auth/register';
import logoutHandler from './auth/logout';
import meHandler from './auth/me';
import testHandler from './test';

// Convert Vercel handlers to Express routes
app.post('/api/auth/login', async (req, res) => {
  try {
    // Convert Express req/res to Vercel format
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await loginHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Login handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await registerHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Register handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await logoutHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Logout handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    console.log('Express headers:', req.headers);
    console.log('Authorization header:', req.headers.authorization);
    
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await meHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Me handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/test', async (req, res) => {
  try {
    const vercelReq = {
      ...req,
      query: req.query as any,
      cookies: req.cookies || {},
      body: req.body,
      headers: req.headers
    };
    
    const vercelRes = {
      status: (code: number) => ({
        json: (data: any) => {
          res.status(code).json(data);
          return vercelRes;
        },
        end: () => {
          res.status(code).end();
          return vercelRes;
        }
      }),
      json: (data: any) => {
        res.json(data);
        return vercelRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return vercelRes;
      }
    };
    
    await testHandler(vercelReq as any, vercelRes as any);
  } catch (error) {
    console.error('Test handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
});

export default app;