export default {
  '/api/users/admin/login': {
    post: {
      summary: 'users Login',
      tags: ['Auth'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  example: 'asp.amalitech@gmail.com'
                },
                password: {
                  type: 'string',
                  example: '@LongPassword123'
                }
              }
            }
          }
        },
        required: true
      },
      responses: {
        200: {
          description: 'Success',
          schema: {
            type: 'object',
            properties: {
              token: {
                type: 'string'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  },

  '/api/users/logout': {
    get: {
      summary: 'Users Logout',
      security: [{ bearerAuth: [] }],
      tags: ['Auth'],
      responses: {
        200: {
          description: 'Success',
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string'
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  },
  '/api/users/admin/create/lecture': {
    post: {
      security: [{ bearerAuth: [] }],
      summary: 'Create Lecture (Admin)',
      tags: ['Admin'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  example: 'f12@example.com'
                },
                firstName: {
                  type: 'string',
                  example: 'John'
                },
                lastName: {
                  type: 'string',
                  example: 'Doe'
                },
                role: {
                  type: 'string',
                  example: 'LECTURER'
                }
              }
            }
          }
        },
        required: true
      },
      responses: {
        201: {
          description: 'Lecture created successfully',
          schema: {
            type: 'object',
            properties: {
              firstName: {
                type: 'string'
              },
              lastName: {
                type: 'string'
              },
              email: {
                type: 'string'
              }
            }
          }
        },
        400: {
          description: 'Bad Request'
        },
        401: {
          description: 'Unauthorized'
        },
        409: {
          description: 'Conflict - Email already in use'
        }
      }
    }
  },

  '/api/users/admin/all/lecture': {
    get: {
      summary: 'List All Lectures (Admin)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          required: false,
          type: 'integer',
          format: 'int32'
        }
      ],
      responses: {
        200: {
          description: 'Success',
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string'
                },
                lastName: {
                  type: 'string'
                },
                email: {
                  type: 'string'
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    },
  },

  '/api/users/admin/dashboard': {
    get: {
      summary: 'List All dashboard Info (Admin)',
      tags: ['Admin'],
      responses: {
        200: {
          description: 'Success',
          schema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                example: 'success'
              },
              data: {
                type: 'object',
                properties: {
                  "lecturers'number": {
                    type: 'integer',
                    example: 2
                  },
                  "student's number": {
                    type: 'integer',
                    example: 2
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized'
        },
        500: {
          description: 'Internal Server Error'
        }
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/api/users/account/claim': {
    post: {
      summary: 'User claim account',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Invite status updated successfully'
        }
      }
    }
  },

  '/api/users/reset/password': {
    post: {
      summary: 'Reset Password',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                newPassword: {
                  type: 'string',
                  example: 'L0ngP@ssw0rd!'
                }
              }
            }
          }
        },
        required: true
      },
      responses: {
        200: {
          description: 'Password reset successful'
        }
      }
    }
  }
};
