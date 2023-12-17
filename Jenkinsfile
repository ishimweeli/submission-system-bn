def appname = 'gitinspired-rw'
def deploy_group = 'ass-3-backend'
def deploy_group_prod = 'gitinspired-capstone-oct'
def s3_bucket = 'capstone-rw-codedeploy'
def s3_filename = 'gitinspired-backend-rw-src-oct'

//Slack Notification Integration
def gitName = env.GIT_BRANCH
def jobName = env.JOB_NAME
def branchName = env.BRANCH_NAME
def main_branch = ['staging', 'develop']

// Environments Declaration
environment {
  jobName = env.JOB_NAME
  branchName = env.BRANCH_NAME
}

// Successful Build
def buildSuccess = [
  [text: "Git-Inspired-Oct Backend Build Successful on ${branchName}",
  fallback: "Git-Inspired-Oct Backend Build Successful on ${branchName}",
  color: "#00FF00"
  ]
]

// Failed Build
def buildError = [
  [text: "Git-Inspired-Oct Backend Build Failed on ${branchName}",
  fallback: "Git-Inspired-Oct Backend Build Failed on ${branchName}",
  color: "#FF0000"
  ]
]

pipeline {
  agent any
  tools {nodejs "nodejs18"}

  stages {
    stage('Install Dependencies') {
        steps {
            sh 'npm install'
        }
    }
    // stage('Run Linters') {
    //     steps {
    //         sh 'npm run lint'
    //     }
    // }
     // stage('Run Unit Tests') {
        //     steps {
        //         withCredentials([file(credentialsId: 'env-file', variable: 'mySecretEnvFile')]){
        //             sh 'cp mySecretEnvFile .env'
        //             sh 'docker build -f Dockerfile.test -t gitinspired-oct .'
        //             sh 'docker rmi gitinspired-oct'
        //         }
        //     }
        // }

        stage('SonarQube Analysis') {
    
      steps {
        withSonarQubeEnv(credentialsId: 'SonarQubeRw', installationName: 'training-sonar-rw') {
          script {
            def scannerHome = tool 'SonarScanner';
            sh "${scannerHome}/bin/sonar-scanner"
          }
        }
      }
    }

    stage('Build') {
      
        steps {
            sh 'npm run build'
        }
    }

     stage('Prepare to Deploy') {
         when {
             anyOf {
                 branch 'staging';
                 branch 'develop';
             }
         }

       steps {
         withAWS(region:'eu-west-1',credentials:'aws-cred') {
           script {
             def gitsha = sh(script: 'git log -n1 --format=format:"%H"', returnStdout: true)
             s3_filename = "${s3_filename}-${gitsha}"
             sh """
                 aws deploy push \
                 --application-name ${appname} \
                 --description "This is a revision for the ${appname}-${gitsha}" \
                 --ignore-hidden-files \
                 --s3-location s3://${s3_bucket}/${s3_filename}.zip \
                 --source .
               """
           }
         }
       }
     }
	 stage('Deploy to Development') {
         when {
             branch 'develop'
         }
       steps {
         withAWS(region:'eu-west-1',credentials:'aws-cred') {
           script {
             sh """
                 aws deploy create-deployment \
                 --application-name ${appname} \
                 --deployment-config-name CodeDeployDefault.OneAtATime \
                 --deployment-group-name ${deploy_group} \
                 --file-exists-behavior OVERWRITE \
                 --s3-location bucket=${s3_bucket},key=${s3_filename}.zip,bundleType=zip
               """
           }
         }
	   }
	 }

    stage('Clean WS') {
      steps {
        cleanWs()
      	}
   	}
 }
 post {
    always {
      echo 'One way or another, I have finished'
      cleanWs()
    }
    success {
      script {
        if (BRANCH_NAME in main_branch) {
            slackSend(channel:"store-front-team-rw", attachments: buildSuccess)
          }
      }
        echo 'I passed successfully'
    }
    unstable {
      echo 'I am unstable :/'
    }
    failure {
    script {
      if (BRANCH_NAME in main_branch) {
          slackSend(channel:"store-front-team-rw", attachments: buildError)
          }
    }
        echo 'I have failed'
    }
    changed {
      echo 'Things were different before..'
    	}
  }
}
