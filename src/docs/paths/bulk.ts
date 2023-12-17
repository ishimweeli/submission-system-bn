export default {
  '/api/users/admin/create/lectures/bulk': {
    post: {
      security: [{ bearerAuth: [] }],
      summary: 'Create Lecture from csv file',
      tags: ['Admin'],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                usersBulk: {
                  type: 'string',
                  format: 'binary'
                },
                userRole: {
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
  '/api/users/admin/create/students/bulk': {
    post: {
      security: [{ bearerAuth: [] }],
      summary: 'Create students from csv file',
      tags: ['Admin'],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                usersBulk: {
                  type: 'string',
                  format: 'binary'
                },
                userRole: {
                  type: 'string',
                  example: 'STUDENT'
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
  }
};
