export const sendEmailTemplateOnAssignment = (
  firstname: string,
  lastname: string,
  title: string,
  deadline: Date,
  assignmentCode: string,
  frontendUrl: string
) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Assign IT</title>
    <style>
      body {
        font-family: sans-serif;
        background-color: #f0f4f8;
        margin: 0;
        padding: 0;
      }
      
      img {
        max-width: 100%;
        max-height: 10rem;
      }
  
      .container {
        max-width: 28rem;
        padding: 1rem;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 0.375rem;
        text-align: center;
        margin: 0 auto;
      }
  
      .header h1 {
        font-weight: bold;
        font-size: 1.875rem;
      }
  
      .main-content {
        display: flex;
        flex-direction: column;
        align-items: center; /* Center content horizontally */
        padding: 1.25rem 0;
      }
  
      .main-content img {
        margin: 0 auto 1.25rem;
        max-width: 100%; /* Make image responsive */
        height: auto; /* Maintain aspect ratio */
      }
  
      .main-content div {
        margin-left: 0; /* Set left margin to 0 */
        margin-bottom: 5rem;
        text-align: left;
      }
  
      .main-content h4 {
        margin-bottom: 8px;
        color: #000000;
      }
  
      .main-content p {
        color: #000000;
        margin-bottom: 1rem; /* Add margin for spacing */
      }
  
      .button {
        margin-top: 0.625rem;
        background-color: #3490dc;
        color: #fff;
        padding: 0.5rem 1rem;
        font-size: 1.125rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        text-decoration: none; /* Remove underlines from anchor elements */
      }
  
      .footer {
        background-color: #ccc;
        color: #666;
        padding: 1.25rem 0;
      }
    </style>
  </head>
  <body>
    <div class="min-h-screen flex flex-col items-center justify-center">
      <div class="container">
        <header class="header">
          <img src="https://res.cloudinary.com/dyjy5ilv1/image/upload/v1698304896/image_p4wjvs.png"/>
        </header>
  
        <main class="main-content">
          <img src="https://res.cloudinary.com/dyjy5ilv1/image/upload/v1698304896/image_720_htzntq.png" alt="image" width="240"/>
          <div>
            <h4>Hi there ${firstname} ${lastname}!</h4>
            <p>You have been invited to partake in this assignment, ${title}, before ${deadline}. Use this ${assignmentCode} to submit your assignment.</p>
          </div>
          <a href='${frontendUrl}/student/dashboard' class="button">View Assignment</a>
        </main>
  
        <footer class="footer">
          <p>&copy; 2023 Assign IT</p>
        </footer>
      </div>
    </div>
  </body>
  </html>
  
    
    `;
};
