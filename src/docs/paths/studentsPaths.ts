export default {
  '/api/users/admin/create/student': {
    post: {
      summary: 'Create a new student',
      tags: ['Admin'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string',
                  example: 'John'
                },
                lastName: {
                  type: 'string',
                  example: 'Doe'
                },
                email: {
                  type: 'string',
                  example: 'john.doe@example.com'
                },
                role: {
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
          description: 'Student created successfully',
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
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },

  '/api/users/admin/edit/student/{id}': {
    patch: {
      summary: 'Update student information',
      tags: ['Admin'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'The ID of the student to be updated',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                firstName: {
                  type: 'string',
                  example: 'Updated First Name'
                },
                lastName: {
                  type: 'string',
                  example: 'Updated Last Name'
                }
              }
            }
          }
        },
        required: true
      },
      responses: {
        200: {
          description: 'Student information updated successfully',
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
        404: {
          description: 'Student not found'
        },
        500: {
          description: 'Internal Server Error'
        }
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/api/users/admin/all/student': {
    get: {
      summary: 'List all students to admin and lecturer',
      tags: ['Admin', 'Lecturer'],
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
      },
      security: [{ bearerAuth: [] }]
    }
  },

  '/api/assignments/student/all/assignments/:userId': {
    get: {
      tags: ['student'],
      description: 'student get all assignments',
      security: [{ bearerAuth: [] }],
      requestBody: {},
      responses: {
        200: {
          description: 'Ok'
        },
        204: {
          description: 'No content'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbiden'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  }
};
