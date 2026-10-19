export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'APD MUSIC CLASS — Enterprise Academy API',
    version: '2.0.0',
    description: `Enterprise-grade multi-branch music academy management API for APD MUSIC CLASS.
Covers 7 instruments, 3 Hyderabad branches (Madhapur, Kokila, Himayatnagar), 10 daily consecutive class slots (08:00–18:00 IST), calendar-month membership calculations, non-destructive renewals, double-booking prevention, role-based access control, and financial reporting.`,
    contact: {
      name: 'APD Music Class Academy Administration',
      email: 'admissions@apdmusicclass.com',
      url: 'https://apdmusicclass.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT bearer token or demo token (demo-owner-token or demo-client-token)'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BAD_REQUEST' },
              message: { type: 'string', example: 'Invalid input' },
              details: { type: 'object' }
            }
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'director@apdmusicclass.com' },
          password: { type: 'string', example: 'password123' }
        }
      },
      Member: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'APD-MEM-001' },
          fullName: { type: 'string', example: 'Aarav Patel' },
          email: { type: 'string', format: 'email', example: 'aarav.patel@example.com' },
          phone: { type: 'string', example: '+91 98765 43210' },
          enrolledInstrumentId: { type: 'string', example: 'guitar' },
          branchId: { type: 'string', example: 'madhapur' },
          status: { type: 'string', enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'PENDING'], example: 'ACTIVE' }
        }
      },
      Booking: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'APD-BKG-8001' },
          memberId: { type: 'string', example: 'APD-MEM-001' },
          branchId: { type: 'string', example: 'madhapur' },
          instrumentId: { type: 'string', example: 'guitar' },
          teacherId: { type: 'string', example: 'TCH-001' },
          classDate: { type: 'string', format: 'date', example: '2026-10-25' },
          slotId: { type: 'integer', minimum: 1, maximum: 10, example: 3 },
          slotLabel: { type: 'string', example: '10:00 - 11:00' },
          status: { type: 'string', enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED'], example: 'CONFIRMED' },
          roomNumber: { type: 'integer', example: 1 }
        }
      },
      CreateBookingRequest: {
        type: 'object',
        required: ['memberId', 'branchId', 'instrumentId', 'classDate', 'slotId'],
        properties: {
          memberId: { type: 'string', example: 'APD-MEM-001' },
          branchId: { type: 'string', enum: ['madhapur', 'kokila', 'himayatnagar'], example: 'madhapur' },
          instrumentId: { type: 'string', enum: ['guitar', 'piano', 'drums', 'sitar', 'violin', 'flute', 'vocals'], example: 'guitar' },
          teacherId: { type: 'string', example: 'TCH-001' },
          classDate: { type: 'string', format: 'date', example: '2026-10-25' },
          slotId: { type: 'integer', minimum: 1, maximum: 10, example: 3 }
        }
      },
      CreateMembershipRequest: {
        type: 'object',
        required: ['memberId', 'planId', 'instrumentId', 'branchId'],
        properties: {
          memberId: { type: 'string', example: 'APD-MEM-001' },
          planId: { type: 'string', enum: ['plan-1m', 'plan-3m', 'plan-6m', 'plan-12m'], example: 'plan-3m' },
          instrumentId: { type: 'string', example: 'guitar' },
          branchId: { type: 'string', example: 'madhapur' },
          startDate: { type: 'string', format: 'date', example: '2026-10-20' },
          paymentMethod: { type: 'string', enum: ['UPI', 'CARD', 'NET_BANKING', 'CASH'], example: 'UPI' }
        }
      },
      FinancialOverview: {
        type: 'object',
        properties: {
          grossRevenueBilled: { type: 'number', example: 125000 },
          collectedPayments: { type: 'number', example: 110000 },
          outstandingPendingPayments: { type: 'number', example: 15000 },
          totalRefunds: { type: 'number', example: 2000 },
          recognizedRevenue: { type: 'number', example: 108000 },
          totalRecordedExpenses: { type: 'number', example: 45000 },
          teacherCompensation: { type: 'number', example: 25000 },
          netProfit: { type: 'number', example: 63000 },
          profitMarginPercent: { type: 'number', example: 58.3 }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Academy Server Health Check',
        responses: {
          '200': {
            description: 'System operational status and current time',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          '200': { description: 'Authenticated successfully with JWT token' },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get currently authenticated user and role profile',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Active user profile' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/branches': {
      get: {
        tags: ['Branches'],
        summary: 'List all academy branches and facility details',
        responses: {
          '200': { description: 'List of branches in Hyderabad' }
        }
      }
    },
    '/api/branches/{id}/address': {
      patch: {
        tags: ['Branches'],
        summary: 'Update branch studio address (Owner only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { address: { type: 'string' } }, required: ['address'] } } }
        },
        responses: {
          '200': { description: 'Branch address updated' },
          '403': { description: 'Forbidden - Owner role required' }
        }
      }
    },
    '/api/instruments': {
      get: {
        tags: ['Instruments'],
        summary: 'List all supported instruments and curricula',
        responses: {
          '200': { description: 'List of 7 instruments' }
        }
      }
    },
    '/api/plans': {
      get: {
        tags: ['Membership Plans'],
        summary: 'List available membership durations (1, 3, 6, 12 months)',
        responses: {
          '200': { description: 'List of membership plans with discounts' }
        }
      }
    },
    '/api/members': {
      get: {
        tags: ['Members'],
        summary: 'List members with optional branch filter (Owner sees all, Client isolated to self)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Members list' }
        }
      },
      post: {
        tags: ['Members'],
        summary: 'Create or enroll new academy member',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Member created successfully' }
        }
      }
    },
    '/api/teachers': {
      get: {
        tags: ['Teachers'],
        summary: 'List music masters and certified instructors',
        responses: {
          '200': { description: 'List of teachers' }
        }
      }
    },
    '/api/memberships': {
      get: {
        tags: ['Memberships'],
        summary: 'List memberships with calendar-month calculated expiries',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of memberships' }
        }
      },
      post: {
        tags: ['Memberships'],
        summary: 'Enroll into new membership with exact calendar-month expiry',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMembershipRequest' } } }
        },
        responses: {
          '201': { description: 'Membership enrolled and payment receipt generated' }
        }
      }
    },
    '/api/memberships/{id}/renew': {
      post: {
        tags: ['Memberships'],
        summary: 'Non-destructive renewal anchored to current expiry date',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Membership renewed with extended expiry' }
        }
      }
    },
    '/api/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List bookings with conflict checking and timezone validation',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Bookings list' }
        }
      },
      post: {
        tags: ['Bookings'],
        summary: 'Book class slot with 3-tier concurrency and overlap protection',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBookingRequest' } } }
        },
        responses: {
          '201': { description: 'Booking confirmed' },
          '409': { description: 'Concurrency collision or double-booking detected' }
        }
      }
    },
    '/api/bookings/{id}/reschedule': {
      patch: {
        tags: ['Bookings'],
        summary: 'Reschedule booking with 24-hour advance notice validation',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Booking rescheduled' },
          '400': { description: 'Less than 24h notice or invalid slot' }
        }
      }
    },
    '/api/payments': {
      get: {
        tags: ['Financials'],
        summary: 'List payment vouchers and transactions',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Payment transactions' }
        }
      },
      post: {
        tags: ['Financials'],
        summary: 'Record new payment receipt',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Payment recorded' }
        }
      }
    },
    '/api/payments/{id}/refund': {
      post: {
        tags: ['Financials'],
        summary: 'Issue audited refund (Owner only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Refund processed and deducted from recognized revenue' },
          '403': { description: 'Forbidden' }
        }
      }
    },
    '/api/expenses': {
      get: {
        tags: ['Financials'],
        summary: 'List operating expenses (Owner only)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Expenses ledger' },
          '403': { description: 'Forbidden' }
        }
      },
      post: {
        tags: ['Financials'],
        summary: 'Create expense entry (Owner only)',
        security: [{ BearerAuth: [] }],
        responses: {
          '201': { description: 'Expense recorded' }
        }
      }
    },
    '/api/reports/overview': {
      get: {
        tags: ['Reports'],
        summary: 'Executive dashboard financial and operational overview (Owner only)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Executive overview' },
          '403': { description: 'Forbidden' }
        }
      }
    },
    '/api/reports/revenue-expenses': {
      get: {
        tags: ['Reports'],
        summary: 'Recognized revenue vs categorized expenses breakdown (Owner only)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Revenue & expense breakdown' }
        }
      }
    },
    '/api/reports/by-instrument': {
      get: {
        tags: ['Reports'],
        summary: 'Instrument profitability ranking and enrollment metrics (Owner only)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Ranked instrument revenue and student counts' }
        }
      }
    },
    '/api/reports/by-branch': {
      get: {
        tags: ['Reports'],
        summary: 'Branch performance, margin, and utilization metrics (Owner only)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Branch metrics' }
        }
      }
    },
    '/api/reports/membership-expiry': {
      get: {
        tags: ['Reports'],
        summary: 'Membership renewal watchlist: 7, 15, 30 days and expired (Owner only)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Expiring memberships with member contact info' }
        }
      }
    }
  }
};
