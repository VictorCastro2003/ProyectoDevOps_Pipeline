pipeline {
  agent any

  stages {
    stage('Cleanup') {
      steps {
        // Matar procesos Node.js que puedan estar bloqueando la DB
        bat 'taskkill /F /IM node.exe /T || exit 0'
        bat 'timeout /t 2 /nobreak'
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        bat 'npm ci'
      }
    }

    stage('Run Tests (Jest -> JUnit)') {
      steps {
        bat 'npm run test:junit'
      }
      post {
        always {
          junit allowEmptyResults: false, testResults: 'reports/junit.xml'
        }
      }
    }

    stage('Lint (ESLint)') {
      steps {
        bat '''
        if not exist reports mkdir reports
        echo Ejecutando ESLint...
        call npm run lint > reports\\eslint.log
        exit /b 0
        '''
        archiveArtifacts artifacts: 'reports\\eslint.log', fingerprint: true
      }
    }

    stage('Archive DB (optional)') {
      steps {
        // Sintaxis correcta para Windows
        bat '''
        if exist db\\users.db (
          if not exist reports\\db mkdir reports\\db
          copy db\\users.db reports\\db\\
        )
        '''
        archiveArtifacts artifacts: 'reports/db/**', allowEmptyArchive: true, fingerprint: true
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
    always {
      // Limpieza final
      bat 'taskkill /F /IM node.exe /T || exit 0'
    }
  }
}