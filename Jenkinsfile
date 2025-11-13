pipeline {
  agent any

  stages {
    stage('Cleanup') {
      steps {
        bat '''
        taskkill /F /IM node.exe /T 2>nul || echo No hay procesos Node.js corriendo
        ping 127.0.0.1 -n 3 > nul
        '''
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
      bat 'taskkill /F /IM node.exe /T 2>nul || echo Limpieza completada'
    }
  }
}