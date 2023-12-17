export const sendEmailTemplateSubmissionStudent = (
  studentFirstName: string,
  studentLastName: string,
  assignmentTitle: string
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
        text-align: left;
        margin: 0 auto;
      }
  
      .header h1 {
        font-weight: bold;
        font-size: 1.875rem;
      }
  
      .main-content {
        padding: 1.25rem 0;
      }
  
      .main-content img {
        margin: 0 auto 1.25rem;
        max-width: 100%; /* Make image responsive */
        height: auto; /* Maintain aspect ratio */
      }
  
      .main-content div {
        padding: 0 1rem; /* Add padding to the content */
      }
  
      .main-content h4 {
        font-weight: bold;
        font-size: 1.5rem; /* Increase font size for better readability */
        color: #000000;
        margin-bottom: 0.5rem; /* Add margin bottom for spacing */
      }
  
      .main-content p {
        text-align: left;
        color: #000000;
        line-height: 1.5; /* Improve line height for better readability */
      }
  
      .button, .image-button {
        margin-top: 1rem; /* Add margin to separate the button from the content */
        background-color: #3490dc;
        color: #fff;
        padding: 0.75rem 1.5rem; /* Increase padding for better touch interaction */
        font-size: 1rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        display: inline-block; /* Align buttons horizontally */
        text-decoration: none; /* Remove underlines from anchor elements */
      }
  
      .button:hover, .image-button:hover {
        background-color: #2c84b4;
      }
  
      .footer {
        background-color: #ccc;
        color: #666;
        padding: 1.25rem 0;
        text-align: center; /* Center text in the footer */
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
          <img src="https://res.cloudinary.com/dyjy5ilv1/image/upload/v1698304896/image_720_htzntq.png" alt="image"/>
          <div>
            <h4>Dear ${studentFirstName} ${studentLastName},</h4>
            <p>You have successfully submitted "${assignmentTitle}".</p>
            <p>We will send you an email once your assignment has been graded.</p>
          </div>
        </main>
  
        <footer class="footer">
          <p>&copy; ${new Date().getFullYear()} Assign IT</p>
        </footer>
      </div>
    </div>
  </body>
  </html>
  `;
};
