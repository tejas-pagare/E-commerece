import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SwiftMart E-Commerce API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for SwiftMart E-Commerce platform',
      contact: {
        name: 'API Support',
        email: 'support@swiftmart.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:8000',
        description: 'Development server'
      },
      {
        url: 'https://api.swiftmart.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in HTTP-only cookie'
        },
        adminCookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'adminToken',
          description: 'Admin JWT token stored in HTTP-only cookie'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            firstname: { type: 'string', example: 'John' },
            lastname: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            cart: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Smartphone' },
            description: { type: 'string', example: 'Latest smartphone with advanced features' },
            price: { type: 'number', example: 599.99 },
            category: { type: 'string', example: 'Electronics' },
            stock: { type: 'integer', example: 50 },
            images: {
              type: 'array',
              items: { type: 'string', format: 'uri' }
            },
            sellerId: { 
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            reviews: {
              type: 'array',
              items: { $ref: '#/components/schemas/Review' }
            },
            rating: { type: 'number', example: 4.5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Seller: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Seller' },
            email: { type: 'string', format: 'email', example: 'seller@example.com' },
            storeName: { type: 'string', example: 'Tech Store' },
            phoneNumber: { type: 'string', example: '+1234567890' },
            gstn: { type: 'string', example: 'GST123456789' },
            bankDetails: {
              type: 'object',
              properties: {
                accountNumber: { type: 'string' },
                ifscCode: { type: 'string' },
                bankName: { type: 'string' }
              }
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            profileImage: { type: 'string', format: 'uri' },
            isApproved: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'integer' },
                  price: { type: 'number' }
                }
              }
            },
            totalAmount: { type: 'number', example: 1299.99 },
            status: { 
              type: 'string', 
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'pending'
            },
            shippingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            paymentMethod: { type: 'string', example: 'stripe' },
            paymentStatus: { 
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              example: 'completed'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string' },
            productId: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Excellent product!' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Blog: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Top 10 Shopping Tips' },
            content: { type: 'string', example: 'Here are the best tips...' },
            author: { type: 'string', example: 'Admin' },
            image: { type: 'string', format: 'uri' },
            tags: {
              type: 'array',
              items: { type: 'string' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Industry: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Electronics' },
            description: { type: 'string', example: 'Electronic products and gadgets' },
            image: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error description' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'User', description: 'User management and authentication' },
      { name: 'Product', description: 'Product catalog operations' },
      { name: 'Seller', description: 'Seller management and operations' },
      { name: 'Admin', description: 'Admin operations and management' },
      { name: 'Order', description: 'Order management' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Review', description: 'Product review operations' },
      { name: 'Blog', description: 'Blog management' },
      { name: 'Industry', description: 'Industry/Category management' },
      { name: 'Manager', description: 'Manager operations' },
      { name: 'Rider', description: 'Delivery rider operations' }
    ]
  },
  apis: ['./routes/*.js', './swagger-docs/*.js'] // Path to API docs
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
