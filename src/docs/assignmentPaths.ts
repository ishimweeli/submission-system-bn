export default {
  '/api/assignments/lecturer/assignment/publish': {
    post: {
      summary: 'Create All Published Assignment (Lecturer)',
      tags: ['Lecturer'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  example: 'Your Assignment Title'
                },
                description: {
                  type: 'string',
                  example: 'Your Assignment Description'
                },
                deadline: {
                  type: 'string',
                  example: new Date()
                }
              }
            }
          }
        },
        required: true
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
          description: 'Forbiden'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  },
  '/api/assignments/lecturer/assignment/draft': {
    post: {
      summary: 'Create All Draft Assignment (Lecturer)',
      tags: ['Lecturer'],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  example: 'Your Draft Assignment Title'
                },
                description: {
                  type: 'string',
                  example: 'Your Draft Assignment Description'
                },
                deadline: {
                  type: 'string',
                  example: new Date()
                }
              }
            }
          }
        },
        required: true
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
          description: 'Forbiden'
        },
        500: {
          description: 'Internal Server Error'
        }
      }
    }
  },

  '/api/assignments/lecturer/delete/published/{assignmentId}': {
    delete: {
      tags: ['Lecturer'],
      description: 'Delete Publish assignment',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'assignmentId',
          required: true
        }
      ],
      requestBody: {},
      responses: {
        200: {
          description: 'Published Assignment deleted successfully'
        },
        400: {
          description: 'Bad request'
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
  },
  '/api/assignments/lecturer/delete/draft/{assignmentId}': {
    delete: {
      tags: ['Lecturer'],
      description: 'Delete Draft assignment',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'assignmentId',
          required: true
        }
      ],
      requestBody: {},
      responses: {
        200: {
          description: 'Draft Assignment deleted successfully'
        },
        400: {
          description: 'Bad request'
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
  },

  '/api/assignments/lecturer/update/{assignmentId}': {
    patch: {
      tags: ['Lecturer'],
      description: 'Edit the assignment',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'assignmentId',
          required: true
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Assignment'
            },
            example: {
              title: 'Updated Assignment Title',
              description: 'Updated Assignment Description',
              deadline: new Date()
            }
          }
        },
        required: true
      },
      responses: {
        200: {
          description: 'Assignment updated successfully'
        },
        400: {
          description: 'Bad request'
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
  },
  '/api/assignments/lecturer/update/isDraft/{assignmentId}': {
    patch: {
      tags: ['Lecturer'],
      description: 'Edit the Draft to publish',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'assignmentId',
          required: true
        }
      ],
      responses: {
        200: {
          description: 'Assignment updated successfully'
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

  '/api/assignments/lecturer/assignments': {
    get: {
      tags: ['Lecturer'],
      description: 'Lecturer list assignments',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'sortBy',
          in: 'query',
          description: 'Sort assignments by date or title',
          required: false,
          schema: {
            type: 'string',
            enum: ['date', 'title']
          }
        }
      ],
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
  },

  '/api/assignments/lecturer/assign/published': {
    post: {
      tags: ['Lecturer'],
      description: 'Publish an assignment to students',
      security: [{ bearerAuth: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                assignmentId: {
                  type: 'integer',
                  description: 'The ID of the assignment to publish.'
                },
                studentIds: {
                  type: 'array',
                  items: {
                    type: 'integer',
                    description: 'An array of student IDs to assign the assignment to.'
                  },
                  description: 'An array of student IDs to assign the assignment to.'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Ok'
        },
        204: {
          description: 'No content'
        },
        400: {
          description: 'Bad Request'
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
  },

  '/api/assignments/assignment/student/:assignmentId': {
    get: {
      tags: ['Lecturer', 'Admin'],
      description: 'Lecturer list assignments',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'assignmentId',
          in: 'query',
          description: 'ID of the assignment to retrieve along with students',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              example: {
                status: 'success',
                data: {
                  // Include the structure of the returned data here based on your service response
                }
              }
            }
          }
        },
        204: {
          description: 'No content'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden'
        },
        500: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              example: {
                status: 'failed',
                message: 'Internal Server Error Details'
              }
            }
          }
        }
      }
    }
  },

  '/api/assignments/lecturer/unAssigned/students/:assignmentId': {
    get: {
      tags: ['Lecturer'],
      description: 'Lecturer list Un assignend Assignement',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'assignmentId',
          in: 'query',
          description: 'ID of the assignment to retrieve un assigned students',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
      responses: {
        200: {
          description: 'OK',
          content: {
            'application/json': {
              example: {
                status: 'success',
                data: {
                  // Include the structure of the returned data here based on your service response
                }
              }
            }
          }
        },
        204: {
          description: 'No content'
        },
        401: {
          description: 'Unauthorized'
        },
        403: {
          description: 'Forbidden'
        },
        500: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              example: {
                status: 'failed',
                message: 'Internal Server Error Details'
              }
            }
          }
        }
      }
    }
  },
  '/api/assignments/lecturer/submissions': {
    get: {
      summary: 'Get assignments with all submissions on them',
      tags: ['Lecturer'],
      description: 'Get assignments with all submissions on them',
      security: [{ bearerAuth: [] }],
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
  },
  '/api/assignments/students/:assignmentId': {
    get: {
      summary: 'Get Specific assingment and all students assignend to it',
      tags: ['Lecturer'],
      description: 'assignment and all students on it',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'assignmentId',
          in: 'query',
          description: 'ID of the assignment to retrieve along with students',
          required: true,
          schema: {
            type: 'string'
          }
        }
      ],
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
