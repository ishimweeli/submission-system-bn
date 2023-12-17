export const sendEmailTemplateSubmission = (
  lecturerFirstName: string,
  studentFirstName: string,
  studentLastName: string,
  assignmentTitle: string,
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
        text-align: left;
        margin: 0 auto;
      }
  
      .header h1 {
        font-weight: bold;
        font-size: 1.875rem;
      }
  
      .main-content {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: flex-start;
        padding: 1.25rem 0;
      }
  
      .main-content img {
        flex-shrink: 0;
        margin: 0 auto 1.25rem;
        max-width: 15rem;
        object-fit: cover;
        width: 33%; /* Set the width to 33% */
      }
  
      .main-content div {
        flex: 1;
      }
  
      .main-content h4 {
        font-weight: bold;
        font-size: 1.25rem;
        color: #000000;
      }
  
      .main-content p {
        text-align: left;
        color: #000000;
      }
  
      .button {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        background-color: #3490dc;
        color: #fff;
        padding: 0.5rem 1rem;
        font-size: 1.125rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
      }
  
      .footer {
        background-color: #ccc;
        color: #666;
        padding: 1.25rem 0;
      }
  
      /* Added code for image button */
      .image-button {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        background-color: #3490dc;
        color: #fff;
        padding: 0.5rem 1rem;
        font-size: 1.125rem;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
      }
  
      .image-button:hover {
        background-color: #2c84b4;
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
          <div style="margin-left: 1rem; margin-bottom: 5rem;">
            <h4>Dear Lecturer ${lecturerFirstName},</h4>
            <p>We would like to invite you to review and evaluate a recent assignment submission made by ${studentFirstName}.</p>
            <p>Student Name: ${studentFirstName} ${studentLastName}</p>
            <p>Assignment Title: ${assignmentTitle}</p>
            <p><em>To access the student's submission, please click on the button below to access the submissions.</em></p>
          </div>
          <table width="100%" height="100%" style="display:table">
            <tr>
              <td style="text-align:center; vertical-align: middle;">
                <div style="border-radius: 10px;width:200px;height:40px;background-color:#5D34EC; margin: auto;">
                  <a href='${frontendUrl}' style="color:#FFFFFF;text-decoration: none;font-size: 20px;display:block; text-align: center; line-height: 40px;">View submissions</a>
                </div>
              </td>
            </tr>
          </table>
        </main>
  
        <footer class="footer">
          <p>&copy; ${new Date().getFullYear()} Assign IT</p>
        </footer>
      </div>
    </div>
  </body>
  </html>`;
};
