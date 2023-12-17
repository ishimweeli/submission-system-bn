export default {
  '/api/submissions/student/create/submission/{assignmentId}': {
    post: {
      summary: 'Create Submissions (Student)',
      tags: ['student'],
      parameters: [
        {
          name: 'assignmentId',
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                snapshotArchive: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Assignment published successfully'
        },
        400: {
          description: 'Bad request'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  },
  '/api/submissions/student/all/submissions': {
    get: {
      summary: 'Get All Submissions Submitted by students',
      tags: ['student', 'Lecturer'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {}
          }
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  },
  '/api/submissions/lecturer/download/submissions': {
    get: {
      summary: 'Download the snapshots to the Desktop',
      tags: ['Lecturer'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'submissionId',
          in: 'query',
          description: 'ID of the submission',
          required: true,
          schema: {
            type: 'string'
          }
        },
        {
          name: 'snapshotId',
          in: 'query',
          description: 'ID of the snapshot',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {}
          }
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  },
  '/api/submissions/lecturer/download/student/all/submissions': {
    get: {
      summary: 'Download whole students project to the Desktop',
      tags: ['Lecturer', 'student'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'submissionId',
          in: 'query',
          description: 'ID of the submission',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {}
          }
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  },
  '/api/submissions/snapshots/:studentId': {
    get: {
      summary: 'On specific students, Get all submission and all snaptions',
      tags: ['Lecturer'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'studentId',
          in: 'query',
          description: 'ID of the submission',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {}
          }
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  }
};
