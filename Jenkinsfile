pipeline {
  agent any

  // ✅ ESTO ES LO QUE FALTABA - Habilita el trigger automático
  triggers {
    githubPush()
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timestamps()
  }

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
        call npm run lint > reports\\eslint.log 2>&1 || echo ESLint completado con warnings
        '''
        archiveArtifacts artifacts: 'reports\\eslint.log', fingerprint: true, allowEmptyArchive: true
      }
    }

    stage('Archive DB (optional)') {
      steps {
        bat '''
        if exist db\\users.db (
          if not exist reports\\db mkdir reports\\db
          copy db\\users.db reports\\db\\
        ) else (
          echo No se encontro base de datos
        )
        '''
        archiveArtifacts artifacts: 'reports/db/**', allowEmptyArchive: true, fingerprint: true
      }
    }

    stage('Finish') {
      steps {
        echo "Pipeline finished successfully!"
      }
    }
  }

  post {
    always {
      script {
        bat 'taskkill /F /IM node.exe /T 2>nul || exit /b 0'
      }
    }
    success {
      echo 'Pipeline completed successfully ✓'
    }
    failure {
      echo 'Pipeline failed — check logs'
    }
  }
}