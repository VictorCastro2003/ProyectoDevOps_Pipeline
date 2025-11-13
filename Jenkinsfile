pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Run Tests (Jest -> JUnit)') {
      steps {
        sh 'npm run test:junit'
      }
      post {
        always {
          junit allowEmptyResults: false, testResults: 'reports/junit.xml'
        }
      }
    }

    stage('Lint (ESLint)') {
      steps {
        sh 'mkdir -p reports || true; npm run lint > reports/eslint.log || true'
        archiveArtifacts artifacts: 'reports/eslint.log', fingerprint: true
      }
    }

    stage('Archive DB (optional)') {
      steps {
        // Archive the sqlite DB so evaluator can see it (only for demo)
        sh 'if [ -f db/users.db ]; then mkdir -p reports/db && cp db/users.db reports/db/; fi'
        archiveArtifacts artifacts: 'reports/db/**', fingerprint: true
      }
    }

    stage('Finish') {
      steps {
        echo "Pipeline finished (success/failure shown by Jenkins)"
      }
    }
  }

  post {
    success {
      echo 'Pipeline completed successfully'
    }
    failure {
      echo 'Pipeline failed — check logs'
    }
  }
}
